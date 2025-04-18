"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Visit, Employee, Group } from "@/types"

interface GroupPerformanceWidgetProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  settings?: Record<string, any>
  onUpdateSettings?: (settings: Record<string, any>) => void
}

export default function GroupPerformanceWidget({
  visits,
  employees,
  groups,
  settings = {},
  onUpdateSettings,
}: GroupPerformanceWidgetProps) {
  const { period = "month" } = settings
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // 기간에 따른 방문 필터링
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (period === "week") {
      // 이번 주
      const day = now.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
      startDate = new Date(now)
      startDate.setDate(now.getDate() - day) // 이번 주 일요일
      startDate.setHours(0, 0, 0, 0)

      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // 이번 주 토요일
      endDate.setHours(23, 59, 59, 999)
    } else if (period === "month") {
      // 이번 달
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      // 올해
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }

    // 기간 내 방문 필터링
    const filteredVisits = visits.filter(
      (visit) => new Date(visit.visitStartTime) >= startDate && new Date(visit.visitStartTime) <= endDate,
    )

    // 지점별 실적 계산
    const groupPerformance = groups
      .map((group) => {
        const groupEmployeeIds = employees.filter((emp) => emp.groupId === group.id).map((emp) => emp.id)

        const groupVisits = filteredVisits.filter((visit) => groupEmployeeIds.includes(visit.employeeId))
        const totalVisits = groupVisits.length
        const completedContracts = groupVisits.filter((visit) => visit.contractStatus === "completed").length
        const totalAmount = groupVisits
          .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
          .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

        return {
          id: group.id,
          name: group.name,
          visits: totalVisits,
          contracts: completedContracts,
          amount: totalAmount,
        }
      })
      .filter((group) => group.visits > 0) // 방문이 있는 지점만 표시
      .sort((a, b) => b.amount - a.amount) // 계약 금액 기준 정렬

    setChartData(groupPerformance)
  }, [visits, employees, groups, period])

  return (
    <div className="h-[200px]">
      {chartData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
          해당 기간에 데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
            <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
            <Tooltip
              formatter={(value, name) => [
                name === "amount" ? `${value.toLocaleString()}원` : `${value}건`,
                name === "amount" ? "계약 금액" : name === "contracts" ? "계약 수" : "방문 수",
              ]}
            />
            <Bar yAxisId="left" dataKey="visits" name="방문 수" fill="#10b981" />
            <Bar yAxisId="left" dataKey="contracts" name="계약 수" fill="#0ea5e9" />
            <Bar yAxisId="right" dataKey="amount" name="계약 금액" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
