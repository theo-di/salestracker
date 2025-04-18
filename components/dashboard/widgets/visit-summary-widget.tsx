"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Visit } from "@/types"

interface VisitSummaryWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
}

export default function VisitSummaryWidget({ visits, settings }: VisitSummaryWidgetProps) {
  // 방문 통계 계산
  const totalVisits = visits.length
  const completedContracts = visits.filter((visit) => visit.contractStatus === "completed").length
  const pendingContracts = visits.filter((visit) => visit.contractStatus === "pending").length
  const totalAmount = visits
    .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
    .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

  // 이번 달 방문만 필터링
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const thisMonthVisits = visits.filter(
    (visit) => new Date(visit.visitStartTime) >= startOfMonth && new Date(visit.visitStartTime) <= endOfMonth,
  )

  const thisMonthTotal = thisMonthVisits.length
  const thisMonthCompleted = thisMonthVisits.filter((visit) => visit.contractStatus === "completed").length
  const thisMonthAmount = thisMonthVisits
    .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
    .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card>
        <CardContent className="p-2">
          <div className="text-xs text-gray-500">총 방문</div>
          <div className="text-xl font-bold">{totalVisits}건</div>
          <div className="text-xs text-gray-500 mt-1">이번 달: {thisMonthTotal}건</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-2">
          <div className="text-xs text-gray-500">계약 완료</div>
          <div className="text-xl font-bold">{completedContracts}건</div>
          <div className="text-xs text-gray-500 mt-1">진행 중: {pendingContracts}건</div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardContent className="p-2">
          <div className="text-xs text-gray-500">총 계약 금액</div>
          <div className="text-xl font-bold">{totalAmount.toLocaleString()}원</div>
          <div className="text-xs text-gray-500 mt-1">이번 달: {thisMonthAmount.toLocaleString()}원</div>
        </CardContent>
      </Card>
    </div>
  )
}
