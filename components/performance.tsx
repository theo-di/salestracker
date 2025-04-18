"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Visit, Employee, Group } from "../types"
import { Search } from "lucide-react"

interface PerformanceProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
  onShowDetails: (type: "all" | "completed" | "amount") => void
}

export default function Performance({ visits, employees, groups, currentUser, onShowDetails }: PerformanceProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")

  // 방문 데이터 필터링
  const filteredVisits = visits.filter((visit) => {
    // 관리자가 아닌 경우 자신의 방문 기록만 볼 수 있음
    if (!currentUser.isAdmin && visit.employeeId !== currentUser.id) {
      return false
    }

    if (selectedEmployee !== "all" && visit.employeeId !== selectedEmployee) {
      return false
    }

    if (selectedGroup !== "all") {
      const employee = employees.find((emp) => emp.id === visit.employeeId)
      if (!employee || employee.groupId !== selectedGroup) {
        return false
      }
    }

    // 기간 필터링
    const visitDate = new Date(visit.visitStartTime)
    const now = new Date()

    if (selectedPeriod === "week") {
      // 이번 주 (일요일부터 토요일까지)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // 이번 주 일요일
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // 이번 주 토요일
      endOfWeek.setHours(23, 59, 59, 999)

      return visitDate >= startOfWeek && visitDate <= endOfWeek
    } else if (selectedPeriod === "month") {
      // 이번 달
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      return visitDate >= startOfMonth && visitDate <= endOfMonth
    } else if (selectedPeriod === "quarter") {
      // 이번 분기
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1)
      const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999)

      return visitDate >= startOfQuarter && visitDate <= endOfQuarter
    } else if (selectedPeriod === "year") {
      // 올해
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

      return visitDate >= startOfYear && visitDate <= endOfYear
    }

    return true
  })

  // 계약 상태별 방문 수
  const visitsByStatus = {
    none: filteredVisits.filter((visit) => visit.contractStatus === "none").length,
    pending: filteredVisits.filter((visit) => visit.contractStatus === "pending").length,
    completed: filteredVisits.filter((visit) => visit.contractStatus === "completed").length,
  }

  // 계약 금액 합계
  const totalContractAmount = filteredVisits
    .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
    .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">실적 분석</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 방문 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredVisits.length}건</p>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => onShowDetails("all")}>
              <Search className="h-4 w-4" />
              <span className="sr-only">상세 보기</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">계약 완료 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{visitsByStatus.completed}건</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onShowDetails("completed")}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">상세 보기</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 계약 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalContractAmount.toLocaleString()}원</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onShowDetails("amount")}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">상세 보기</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {currentUser.isAdmin && (
          <div>
            <Label htmlFor="employee">직원 선택</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="직원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직원</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="group">지점 선택</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger id="group">
              <SelectValue placeholder="지점 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지점</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="period">기간 선택</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="period">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">이번 주</SelectItem>
              <SelectItem value="month">이번 달</SelectItem>
              <SelectItem value="quarter">이번 분기</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Removed the chart section as requested */}
    </div>
  )
}
