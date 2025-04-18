"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { Visit } from "@/types"

interface RecentVisitsWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
}

export default function RecentVisitsWidget({ visits, settings = {} }: RecentVisitsWidgetProps) {
  const { limit = 5 } = settings

  // 최근 방문 정렬
  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.visitStartTime).getTime() - new Date(a.visitStartTime).getTime())
    .slice(0, limit)

  // 계약 상태에 따른 아이콘 및 색상
  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    } else if (status === "pending") {
      return <Clock className="h-3 w-3 text-blue-500" />
    } else {
      return <AlertCircle className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <ScrollArea className="h-[200px]">
      {recentVisits.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">방문 기록이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {recentVisits.map((visit) => (
            <div key={visit.id} className="border rounded-md p-2 text-sm">
              <div className="flex justify-between items-start">
                <div className="font-medium">{visit.hospitalName}</div>
                <div className="flex items-center text-xs">
                  {getStatusIcon(visit.contractStatus)}
                  <span className="ml-1">
                    {visit.contractStatus === "completed"
                      ? "계약 완료"
                      : visit.contractStatus === "pending"
                        ? "계약 진행 중"
                        : "계약 없음"}
                  </span>
                </div>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {format(new Date(visit.visitStartTime), "yyyy년 M월 d일 (EEE) HH:mm", { locale: ko })}
              </div>
              {visit.contractAmount && visit.contractStatus === "completed" && (
                <div className="text-green-600 text-xs mt-1 font-medium">{visit.contractAmount.toLocaleString()}원</div>
              )}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
}
