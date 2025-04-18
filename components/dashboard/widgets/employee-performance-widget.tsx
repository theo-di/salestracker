"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Visit, Employee } from "@/types"

interface EmployeePerformanceWidgetProps {
  visits: Visit[]
  employees: Employee[]
  settings?: Record<string, any>
  onUpdateSettings?: (settings: Record<string, any>) => void
}

export default function EmployeePerformanceWidget({
  visits,
  employees,
  settings = {},
  onUpdateSettings,
}: EmployeePerformanceWidgetProps) {
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

    // 직원별 실적 계산
    const employeePerformance = employees
      .map((employee) => {
        const employeeVisits = filteredVisits.filter((visit) => visit.employeeId === employee.id)
        const totalVisits = employeeVisits.length
        const completedContracts = employeeVisits.filter((visit) => visit.contractStatus === "completed").length
        const totalAmount = employeeVisits
          .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
          .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

        return {
          id: employee.id,
          name: employee.name,
          visits: totalVisits,
          contracts: completedContracts,
          amount: totalAmount,
        }
      })
      .filter((emp) => emp.visits > 0) // 방문이 있는 직원만 표시
      .sort((a, b) => b.amount - a.amount) // 계약 금액 기준 정렬
      .slice(0, 5) // 상위 5명만 표시

    setChartData(employeePerformance)
  }, [visits, employees, period])

  return (
    <div className="space-y-2">
      <div className="h-[180px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            해당 기간에 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={60} />
              <Tooltip
                formatter={(value, name) => [
                  name === "amount" ? `${value.toLocaleString()}원` : `${value}건`,
                  name === "amount" ? "계약 금액" : name === "contracts" ? "계약 수" : "방문 수",
                ]}
              />
              <Bar dataKey="visits" name="방문 수" fill="#10b981" />
              <Bar dataKey="contracts" name="계약 수" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <ScrollArea className="h-[80px]">
        <div className="space-y-1">
          {chartData.map((employee) => (
            <div key={employee.id} className="flex justify-between text-xs">
              <span>{employee.name}</span>
              <span className="font-medium">{employee.amount.toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
