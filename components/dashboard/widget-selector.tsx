"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WidgetType, WidgetConfig } from "./dashboard"
import { BarChart3, Calendar, Clock, MapPin, PieChart, Users, Building2, FileText } from "lucide-react"

interface WidgetSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (type: WidgetType, title: string, size?: "small" | "medium" | "large") => void
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
  existingWidgets: WidgetConfig[]
}

interface WidgetOption {
  type: WidgetType
  title: string
  description: string
  icon: React.ReactNode
  defaultSize: "small" | "medium" | "large"
  adminOnly?: boolean
}

export default function WidgetSelector({
  isOpen,
  onClose,
  onAddWidget,
  currentUser,
  existingWidgets,
}: WidgetSelectorProps) {
  // 사용 가능한 위젯 목록
  const availableWidgets: WidgetOption[] = [
    {
      type: "visit-summary",
      title: "방문 요약",
      description: "총 방문 수, 계약 완료 수, 계약 금액 등의 요약 정보를 표시합니다.",
      icon: <PieChart className="h-5 w-5" />,
      defaultSize: "small",
    },
    {
      type: "schedule",
      title: "일정",
      description: "오늘 또는 이번 주의 방문 일정을 표시합니다.",
      icon: <Calendar className="h-5 w-5" />,
      defaultSize: "medium",
    },
    {
      type: "performance",
      title: "개인 실적",
      description: "개인 실적 차트를 표시합니다.",
      icon: <BarChart3 className="h-5 w-5" />,
      defaultSize: "medium",
    },
    {
      type: "recent-visits",
      title: "최근 방문",
      description: "최근 방문 기록을 표시합니다.",
      icon: <Clock className="h-5 w-5" />,
      defaultSize: "medium",
    },
    {
      type: "contract-status",
      title: "계약 상태",
      description: "계약 상태별 통계를 표시합니다.",
      icon: <FileText className="h-5 w-5" />,
      defaultSize: "small",
    },
    {
      type: "location-map",
      title: "위치 지도",
      description: "방문 위치를 지도에 표시합니다.",
      icon: <MapPin className="h-5 w-5" />,
      defaultSize: "medium",
    },
    {
      type: "employee-performance",
      title: "직원 실적",
      description: "직원별 실적을 비교합니다.",
      icon: <Users className="h-5 w-5" />,
      defaultSize: "large",
      adminOnly: true,
    },
    {
      type: "group-performance",
      title: "지점 실적",
      description: "지점별 실적을 비교합니다.",
      icon: <Building2 className="h-5 w-5" />,
      defaultSize: "large",
      adminOnly: true,
    },
  ]

  // 이미 추가된 위젯 필터링
  const getFilteredWidgets = () => {
    return availableWidgets.filter((widget) => {
      // 관리자 전용 위젯 필터링
      if (widget.adminOnly && !currentUser.isAdmin) {
        return false
      }

      // 이미 추가된 단일 인스턴스 위젯 필터링 (방문 요약, 개인 실적, 계약 상태, 위치 지도)
      if (
        ["visit-summary", "performance", "contract-status", "location-map"].includes(widget.type) &&
        existingWidgets.some((w) => w.type === widget.type)
      ) {
        return false
      }

      return true
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>위젯 추가</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredWidgets().map((widget) => (
              <Button
                key={widget.type}
                variant="outline"
                className="h-auto p-4 justify-start flex-col items-start text-left"
                onClick={() => onAddWidget(widget.type, widget.title, widget.defaultSize)}
              >
                <div className="flex items-center mb-2">
                  <div className="bg-primary/10 p-2 rounded-full mr-2">{widget.icon}</div>
                  <span className="font-medium">{widget.title}</span>
                </div>
                <p className="text-sm text-gray-500 font-normal">{widget.description}</p>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
