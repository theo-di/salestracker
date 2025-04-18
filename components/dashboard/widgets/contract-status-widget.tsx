"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Visit } from "@/types"

interface ContractStatusWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
}

export default function ContractStatusWidget({ visits, settings }: ContractStatusWidgetProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // 계약 상태별 통계 계산
    const completed = visits.filter((visit) => visit.contractStatus === "completed").length
    const pending = visits.filter((visit) => visit.contractStatus === "pending").length
    const none = visits.filter((visit) => visit.contractStatus === "none").length

    const data = [
      { name: "완료", value: completed, color: "#10b981" },
      { name: "진행 중", value: pending, color: "#0ea5e9" },
      { name: "없음", value: none, color: "#d1d5db" },
    ].filter((item) => item.value > 0) // 값이 0인 항목 제외

    setChartData(data)
  }, [visits])

  return (
    <div className="h-[200px]">
      {chartData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">데이터가 없습니다.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}건`, "계약 수"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
