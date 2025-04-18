"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WidgetGrid from "./widget-grid"
import WidgetSelector from "./widget-selector"
import type { Visit, Employee, Group } from "@/types"

interface DashboardProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
}

export type WidgetType =
  | "visit-summary"
  | "schedule"
  | "performance"
  | "recent-visits"
  | "contract-status"
  | "location-map"
  | "employee-performance"
  | "group-performance"

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  size: "small" | "medium" | "large"
  position: number
  settings?: Record<string, any>
}

export default function Dashboard({ visits, employees, groups, currentUser }: DashboardProps) {
  const { toast } = useToast()
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [showWidgetSelector, setShowWidgetSelector] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // 대시보드 설정 불러오기
  useEffect(() => {
    const loadDashboard = () => {
      const savedWidgets = localStorage.getItem(`dashboard_${currentUser.id}`)

      if (savedWidgets) {
        try {
          setWidgets(JSON.parse(savedWidgets))
        } catch (error) {
          console.error("대시보드 설정을 불러오는 중 오류 발생:", error)
          setDefaultWidgets()
        }
      } else {
        setDefaultWidgets()
      }
    }

    loadDashboard()
  }, [currentUser.id])

  // 기본 위젯 설정
  const setDefaultWidgets = () => {
    const defaultWidgets: WidgetConfig[] = [
      {
        id: `widget_${Date.now()}_1`,
        type: "visit-summary",
        title: "방문 요약",
        size: "small",
        position: 0,
      },
      {
        id: `widget_${Date.now()}_2`,
        type: "schedule",
        title: "오늘의 일정",
        size: "medium",
        position: 1,
        settings: { period: "today" },
      },
      {
        id: `widget_${Date.now()}_3`,
        type: "recent-visits",
        title: "최근 방문",
        size: "medium",
        position: 2,
      },
    ]

    // 관리자인 경우 추가 위젯
    if (currentUser.isAdmin) {
      defaultWidgets.push({
        id: `widget_${Date.now()}_4`,
        type: "employee-performance",
        title: "직원 실적",
        size: "large",
        position: 3,
      })
    }

    setWidgets(defaultWidgets)
    saveWidgets(defaultWidgets)
  }

  // 위젯 추가
  const handleAddWidget = (type: WidgetType, title: string, size: "small" | "medium" | "large" = "medium") => {
    const newWidget: WidgetConfig = {
      id: `widget_${Date.now()}`,
      type,
      title,
      size,
      position: widgets.length,
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    saveWidgets(updatedWidgets)
    setShowWidgetSelector(false)

    toast({
      title: "위젯 추가 완료",
      description: `${title} 위젯이 대시보드에 추가되었습니다.`,
    })
  }

  // 위젯 제거
  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)

    // 위치 재조정
    const reorderedWidgets = updatedWidgets.map((widget, index) => ({
      ...widget,
      position: index,
    }))

    setWidgets(reorderedWidgets)
    saveWidgets(reorderedWidgets)

    toast({
      title: "위젯 제거 완료",
      description: "위젯이 대시보드에서 제거되었습니다.",
    })
  }

  // 위젯 순서 변경
  const handleReorderWidgets = (startIndex: number, endIndex: number) => {
    const result = Array.from(widgets)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    // 위치 업데이트
    const updatedWidgets = result.map((widget, index) => ({
      ...widget,
      position: index,
    }))

    setWidgets(updatedWidgets)
    saveWidgets(updatedWidgets)
  }

  // 위젯 설정 업데이트
  const handleUpdateWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    const updatedWidgets = widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, settings: { ...widget.settings, ...settings } } : widget,
    )

    setWidgets(updatedWidgets)
    saveWidgets(updatedWidgets)
  }

  // 위젯 크기 변경
  const handleResizeWidget = (widgetId: string, size: "small" | "medium" | "large") => {
    const updatedWidgets = widgets.map((widget) => (widget.id === widgetId ? { ...widget, size } : widget))

    setWidgets(updatedWidgets)
    saveWidgets(updatedWidgets)
  }

  // 위젯 설정 저장
  const saveWidgets = (widgetsToSave: WidgetConfig[]) => {
    localStorage.setItem(`dashboard_${currentUser.id}`, JSON.stringify(widgetsToSave))
  }

  // 대시보드 저장
  const handleSaveDashboard = () => {
    saveWidgets(widgets)
    setIsEditMode(false)

    toast({
      title: "대시보드 저장 완료",
      description: "대시보드 설정이 저장되었습니다.",
    })
  }

  // 대시보드 초기화
  const handleResetDashboard = () => {
    setDefaultWidgets()
    setIsEditMode(false)

    toast({
      title: "대시보드 초기화 완료",
      description: "대시보드가 기본 설정으로 초기화되었습니다.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">내 대시보드</h2>
        <div className="flex space-x-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setShowWidgetSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                위젯 추가
              </Button>
              <Button variant="outline" onClick={handleResetDashboard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>
              <Button onClick={handleSaveDashboard}>
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>대시보드 편집</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <WidgetGrid
            widgets={widgets}
            visits={visits}
            employees={employees}
            groups={groups}
            currentUser={currentUser}
            isEditMode={isEditMode}
            onRemoveWidget={handleRemoveWidget}
            onReorderWidgets={handleReorderWidgets}
            onUpdateWidgetSettings={handleUpdateWidgetSettings}
            onResizeWidget={handleResizeWidget}
          />
        </CardContent>
      </Card>

      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onAddWidget={handleAddWidget}
        currentUser={currentUser}
        existingWidgets={widgets}
      />
    </div>
  )
}
