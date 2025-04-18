"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GripVertical, X, Settings, Maximize, Minimize } from "lucide-react"
import type { WidgetConfig } from "./dashboard"
import VisitSummaryWidget from "./widgets/visit-summary-widget"
import ScheduleWidget from "./widgets/schedule-widget"
import PerformanceWidget from "./widgets/performance-widget"
import RecentVisitsWidget from "./widgets/recent-visits-widget"
import ContractStatusWidget from "./widgets/contract-status-widget"
import LocationMapWidget from "./widgets/location-map-widget"
import EmployeePerformanceWidget from "./widgets/employee-performance-widget"
import GroupPerformanceWidget from "./widgets/group-performance-widget"
import type { Visit, Employee, Group } from "@/types"

interface WidgetProps {
  config: WidgetConfig
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
  isEditMode: boolean
  dragHandleProps?: any
  onRemove: () => void
  onUpdateSettings: (settings: Record<string, any>) => void
  onResize: (size: "small" | "medium" | "large") => void
}

export default function Widget({
  config,
  visits,
  employees,
  groups,
  currentUser,
  isEditMode,
  dragHandleProps,
  onRemove,
  onUpdateSettings,
  onResize,
}: WidgetProps) {
  const [showSettings, setShowSettings] = useState(false)

  // 위젯 내용 렌더링
  const renderWidgetContent = () => {
    const { type, settings = {} } = config

    // 사용자 권한에 따른 방문 필터링
    const filteredVisits = currentUser.isAdmin ? visits : visits.filter((visit) => visit.employeeId === currentUser.id)

    switch (type) {
      case "visit-summary":
        return <VisitSummaryWidget visits={filteredVisits} settings={settings} />
      case "schedule":
        return <ScheduleWidget visits={filteredVisits} settings={settings} onUpdateSettings={onUpdateSettings} />
      case "performance":
        return <PerformanceWidget visits={filteredVisits} settings={settings} />
      case "recent-visits":
        return <RecentVisitsWidget visits={filteredVisits} settings={settings} />
      case "contract-status":
        return <ContractStatusWidget visits={filteredVisits} settings={settings} />
      case "location-map":
        return <LocationMapWidget visits={filteredVisits} settings={settings} />
      case "employee-performance":
        return (
          <EmployeePerformanceWidget
            visits={visits}
            employees={employees}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )
      case "group-performance":
        return (
          <GroupPerformanceWidget
            visits={visits}
            employees={employees}
            groups={groups}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )
      default:
        return <div className="p-4 text-center text-gray-500">지원되지 않는 위젯 유형입니다.</div>
    }
  }

  // 위젯 크기 조절
  const handleResize = () => {
    const currentSize = config.size
    let newSize: "small" | "medium" | "large"

    if (currentSize === "small") newSize = "medium"
    else if (currentSize === "medium") newSize = "large"
    else newSize = "small"

    onResize(newSize)
  }

  return (
    <Card className="h-full">
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          {isEditMode && (
            <div {...dragHandleProps} className="cursor-grab mr-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        </div>
        {isEditMode && (
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handleResize} className="h-6 w-6">
              {config.size === "large" ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
            </Button>
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Settings className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">위젯 설정</h4>
                  {config.type === "schedule" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">기간 설정</label>
                      <Tabs
                        value={config.settings?.period || "today"}
                        onValueChange={(value) => onUpdateSettings({ period: value })}
                      >
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="today">오늘</TabsTrigger>
                          <TabsTrigger value="week">이번 주</TabsTrigger>
                          <TabsTrigger value="month">이번 달</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  )}
                  {config.type === "recent-visits" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">표시할 항목 수</label>
                      <Tabs
                        value={String(config.settings?.limit || 5)}
                        onValueChange={(value) => onUpdateSettings({ limit: Number(value) })}
                      >
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="3">3개</TabsTrigger>
                          <TabsTrigger value="5">5개</TabsTrigger>
                          <TabsTrigger value="10">10개</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  )}
                  {(config.type === "employee-performance" || config.type === "group-performance") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">기간 설정</label>
                      <Tabs
                        value={config.settings?.period || "month"}
                        onValueChange={(value) => onUpdateSettings({ period: value })}
                      >
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="week">주간</TabsTrigger>
                          <TabsTrigger value="month">월간</TabsTrigger>
                          <TabsTrigger value="year">연간</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  )}
                  <Button className="w-full" onClick={() => setShowSettings(false)}>
                    설정 저장
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0">{renderWidgetContent()}</CardContent>
    </Card>
  )
}
