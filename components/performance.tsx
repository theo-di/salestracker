"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Visit, Employee, Group } from "../types"

interface PerformanceProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
}

export default function Performance({ visits, employees, groups }: PerformanceProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")

  // 방문 데이터 필터링
  const filteredVisits = visits.filter((visit) => {
    if (selectedEmployee !== "all" && visit.employeeId !== selectedEmployee) {
      return false
    }

    if (selectedGroup !== "all") {
      const employee = employees.find((emp) => emp.id === visit.employeeId)
      if (!employee || employee.groupId !== selectedGroup) {
        return false
      }
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

  // 직원별 방문 수
  const visitsByEmployee = employees
    .map((employee) => {
      const employeeVisits = visits.filter((visit) => visit.employeeId === employee.id)
      return {
        name: employee.name,
        visits: employeeVisits.length,
        completed: employeeVisits.filter((visit) => visit.contractStatus === "completed").length,
        amount: employeeVisits
          .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
          .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0),
      }
    })
    .sort((a, b) => b.visits - a.visits)

  // 그룹별 방문 수
  const visitsByGroup = groups
    .map((group) => {
      const groupEmployees = employees.filter((emp) => emp.groupId === group.id)
      const groupVisits = visits.filter((visit) => groupEmployees.some((emp) => emp.id === visit.employeeId))

      return {
        name: group.name,
        visits: groupVisits.length,
        completed: groupVisits.filter((visit) => visit.contractStatus === "completed").length,
        amount: groupVisits
          .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
          .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0),
      }
    })
    .sort((a, b) => b.visits - a.visits)

  // 차트 데이터
  const statusChartData = [
    { name: "계약 없음", value: visitsByStatus.none },
    { name: "계약 진행 중", value: visitsByStatus.pending },
    { name: "계약 완료", value: visitsByStatus.completed },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">실적 분석</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 방문 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredVisits.length}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">계약 완료 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{visitsByStatus.completed}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 계약 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalContractAmount.toLocaleString()}원</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        <div>
          <Label htmlFor="group">그룹 선택</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger id="group">
              <SelectValue placeholder="그룹 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 그룹</SelectItem>
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

      <Tabs defaultValue="overall" className="w-full">
        <TabsList>
          <TabsTrigger value="overall">전체 현황</TabsTrigger>
          <TabsTrigger value="employee">직원별 현황</TabsTrigger>
          <TabsTrigger value="group">그룹별 현황</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle>계약 상태별 방문 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="방문 수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee">
          <Card>
            <CardHeader>
              <CardTitle>직원별 방문 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitsByEmployee}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#10b981" name="총 방문 수" />
                    <Bar dataKey="completed" fill="#0ea5e9" name="계약 완료 수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>그룹별 방문 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitsByGroup}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#10b981" name="총 방문 수" />
                    <Bar dataKey="completed" fill="#0ea5e9" name="계약 완료 수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
