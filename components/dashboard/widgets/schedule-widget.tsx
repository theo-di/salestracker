"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar, Clock, MapPin } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Visit } from "@/types"

interface ScheduleWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
  onUpdateSettings?: (settings: Record<string, any>) => void
}

export default function ScheduleWidget({ visits, settings = {}, onUpdateSettings }: ScheduleWidgetProps) {
  const { period = "today" } = settings
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([])

  useEffect(() => {
    // 기간에 따른 방문 필터링
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (period === "today") {
      // 오늘
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    } else if (period === "week") {
      // 이번 주 (일요일부터 토요일까지)
      const day = now.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
      startDate = new Date(now)
      startDate.setDate(now.getDate() - day) // 이번 주 일요일
      startDate.setHours(0, 0, 0, 0)

      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // 이번 주 토요일
      endDate.setHours(23, 59, 59, 999)
    } else {
      // 이번 달
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // 방문 필터링 및 정렬
    const filtered = visits
      .filter((visit) => new Date(visit.visitStartTime) >= startDate && new Date(visit.visitStartTime) <= endDate)
      .sort((a, b) => new Date(a.visitStartTime).getTime() - new Date(b.visitStartTime).getTime())

    setFilteredVisits(filtered)
  }, [visits, period])

  // 요일 구하기
  const getDayOfWeek = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return days[new Date(date).getDay()]
  }

  // 기간 제목 생성
  const getPeriodTitle = () => {
    const now = new Date()

    if (period === "today") {
      return `오늘 (${format(now, "M월 d일")} ${getDayOfWeek(now)})`
    } else if (period === "week") {
      const day = now.getDay()
      const sunday = new Date(now)
      sunday.setDate(now.getDate() - day)

      const saturday = new Date(sunday)
      saturday.setDate(sunday.getDate() + 6)

      return `이번 주 (${format(sunday, "M.d")}~${format(saturday, "M.d")})`
    } else {
      return `${now.getMonth() + 1}월`
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm font-medium">
        <Calendar className="h-4 w-4 mr-1" />
        <span>{getPeriodTitle()} 일정</span>
      </div>

      <ScrollArea className="h-[180px]">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {period === "today" ? "오늘" : period === "week" ? "이번 주" : "이번 달"}의 일정이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVisits.map((visit) => (
              <div key={visit.id} className="border rounded-md p-2 text-sm">
                <div className="font-medium">{visit.hospitalName}</div>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{format(new Date(visit.visitStartTime), "M월 d일 (EEE) HH:mm", { locale: ko })}</span>
                </div>
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{visit.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
