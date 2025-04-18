"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Visit } from "@/types"

interface PerformanceWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
}

export default function PerformanceWidget({ visits, settings }: PerformanceWidgetProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // 최근 6개월 데이터 준비
    const now = new Date()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleDateString("ko-KR", { month: "short" })

      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999)

      const monthVisits = visits.filter(
        (visit) => new Date(visit.visitStartTime) >= monthStart && new Date(visit.visitStartTime) <= monthEnd,
      )

      const totalVisits = monthVisits.length
      const completedContracts = monthVisits.filter((visit) => visit.contractStatus === "completed").length
      const totalAmount = monthVisits
        .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
        .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

      data.push({
        name: monthName,
        방문수: totalVisits,
        계약수: completedContracts,
        금액: Math.round(totalAmount / 10000), // 만원 단위로 변환
      })
    }

    setChartData(data)
  }, [visits])

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={10} />
          <YAxis fontSize={10} />
          <Tooltip />
          <Bar dataKey="방문수" fill="#10b981" />
          <Bar dataKey="계약수" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
