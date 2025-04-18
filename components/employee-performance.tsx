"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Edit, Trash2 } from "lucide-react"
import SimpleModal from "./simple-modal"
import type { Visit, Employee, Group } from "@/types"

interface EmployeePerformanceProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  onUpdateVisit: (visit: Visit) => void
}

export default function EmployeePerformance({ visits, employees, groups, onUpdateVisit }: EmployeePerformanceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // 기간에 따른 필터링
  const getFilteredVisits = () => {
    let filteredVisits = [...visits]

    // 직원 필터링
    if (selectedEmployee !== "all") {
      filteredVisits = filteredVisits.filter((visit) => visit.employeeId === selectedEmployee)
    }

    // 그룹 필터링
    if (selectedGroup !== "all") {
      const groupEmployeeIds = employees.filter((emp) => emp.groupId === selectedGroup).map((emp) => emp.id)

      filteredVisits = filteredVisits.filter((visit) => groupEmployeeIds.includes(visit.employeeId))
    }

    // 기간 필터링
    const now = new Date()

    if (selectedPeriod === "day") {
      // 오늘
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfDay && visitDate <= endOfDay
      })
    } else if (selectedPeriod === "week") {
      // 이번 주
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // 이번 주 일요일
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // 이번 주 토요일
      endOfWeek.setHours(23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfWeek && visitDate <= endOfWeek
      })
    } else if (selectedPeriod === "month") {
      // 이번 달
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfMonth && visitDate <= endOfMonth
      })
    } else if (selectedPeriod === "quarter") {
      // 이번 분기
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1)
      const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfQuarter && visitDate <= endOfQuarter
      })
    } else if (selectedPeriod === "half") {
      // 상/하반기
      const isFirstHalf = now.getMonth() < 6
      const startOfHalf = new Date(now.getFullYear(), isFirstHalf ? 0 : 6, 1)
      const endOfHalf = new Date(now.getFullYear(), isFirstHalf ? 6 : 12, 0, 23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfHalf && visitDate <= endOfHalf
      })
    } else if (selectedPeriod === "year") {
      // 올해
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

      filteredVisits = filteredVisits.filter((visit) => {
        const visitDate = new Date(visit.visitStartTime)
        return visitDate >= startOfYear && visitDate <= endOfYear
      })
    }

    return filteredVisits
  }

  const filteredVisits = getFilteredVisits()

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
        group: employee.groupName || "미지정",
        totalVisits,
        completedContracts,
        totalAmount,
        conversionRate: totalVisits > 0 ? ((completedContracts / totalVisits) * 100).toFixed(1) : "0.0",
      }
    })
    .filter((emp) => emp.totalVisits > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)

  // 그룹별 실적 계산
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
        totalVisits,
        completedContracts,
        totalAmount,
        conversionRate: totalVisits > 0 ? ((completedContracts / totalVisits) * 100).toFixed(1) : "0.0",
      }
    })
    .filter((group) => group.totalVisits > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)

  // 계약 금액 수정 처리
  const handleEditAmount = (visit: Visit) => {
    setEditingVisit({ ...visit })
    setShowEditModal(true)
  }

  // 계약 금액 수정 저장
  const handleSaveEdit = () => {
    if (editingVisit) {
      onUpdateVisit(editingVisit)
      setShowEditModal(false)
      setEditingVisit(null)
    }
  }

  // 계약 금액 제거
  const handleRemoveAmount = (visit: Visit) => {
    const updatedVisit = { ...visit, contractAmount: undefined }
    onUpdateVisit(updatedVisit)
  }

  // 차트 데이터
  const employeeChartData = employeePerformance.slice(0, 10) // 상위 10명만 표시
  const groupChartData = groupPerformance

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">직원별 실적 분석</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="period-filter">기간 선택</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="period-filter">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일별</SelectItem>
              <SelectItem value="week">주간별</SelectItem>
              <SelectItem value="month">월별</SelectItem>
              <SelectItem value="quarter">분기별</SelectItem>
              <SelectItem value="half">상/하반기</SelectItem>
              <SelectItem value="year">연간</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="employee-filter">직원 선택</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger id="employee-filter">
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
          <Label htmlFor="group-filter">지점 선택</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger id="group-filter">
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
      </div>

      <Tabs defaultValue="employee" className="w-full">
        <TabsList>
          <TabsTrigger value="employee">직원별 실적</TabsTrigger>
          <TabsTrigger value="group">지점별 실적</TabsTrigger>
          <TabsTrigger value="contracts">계약 금액 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="employee">
          <Card>
            <CardHeader>
              <CardTitle>직원별 실적 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>직원명</TableHead>
                      <TableHead>소속 지점</TableHead>
                      <TableHead>총 방문 수</TableHead>
                      <TableHead>계약 완료 수</TableHead>
                      <TableHead>전환율</TableHead>
                      <TableHead>총 계약 금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          해당 기간에 실적 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeePerformance.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.group}</TableCell>
                          <TableCell>{emp.totalVisits}건</TableCell>
                          <TableCell>{emp.completedContracts}건</TableCell>
                          <TableCell>{emp.conversionRate}%</TableCell>
                          <TableCell>{emp.totalAmount.toLocaleString()}원</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalVisits" fill="#10b981" name="총 방문 수" />
                    <Bar yAxisId="left" dataKey="completedContracts" fill="#0ea5e9" name="계약 완료 수" />
                    <Bar yAxisId="right" dataKey="totalAmount" fill="#f59e0b" name="총 계약 금액(만원)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>지점별 실적 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>지점명</TableHead>
                      <TableHead>총 방문 수</TableHead>
                      <TableHead>계약 완료 수</TableHead>
                      <TableHead>전환율</TableHead>
                      <TableHead>총 계약 금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          해당 기간에 실적 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupPerformance.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.totalVisits}건</TableCell>
                          <TableCell>{group.completedContracts}건</TableCell>
                          <TableCell>{group.conversionRate}%</TableCell>
                          <TableCell>{group.totalAmount.toLocaleString()}원</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalVisits" fill="#10b981" name="총 방문 수" />
                    <Bar yAxisId="left" dataKey="completedContracts" fill="#0ea5e9" name="계약 완료 수" />
                    <Bar yAxisId="right" dataKey="totalAmount" fill="#f59e0b" name="총 계약 금액(만원)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>계약 금액 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>방문 일시</TableHead>
                      <TableHead>병원명</TableHead>
                      <TableHead>담당 직원</TableHead>
                      <TableHead>계약 상태</TableHead>
                      <TableHead>계약 금액</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.filter(
                      (visit) => visit.contractStatus === "completed" || visit.contractStatus === "pending",
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          해당 기간에 계약 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVisits
                        .filter((visit) => visit.contractStatus === "completed" || visit.contractStatus === "pending")
                        .sort((a, b) => new Date(b.visitStartTime).getTime() - new Date(a.visitStartTime).getTime())
                        .map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell>{new Date(visit.visitStartTime).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{visit.hospitalName}</TableCell>
                            <TableCell>{visit.employeeName}</TableCell>
                            <TableCell>{visit.contractStatus === "pending" ? "계약 진행 중" : "계약 완료"}</TableCell>
                            <TableCell>
                              {visit.contractAmount ? visit.contractAmount.toLocaleString() + "원" : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="icon" onClick={() => handleEditAmount(visit)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {visit.contractAmount && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => handleRemoveAmount(visit)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 계약 금액 수정 모달 */}
      {editingVisit && (
        <SimpleModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="계약 금액 수정">
          <div className="space-y-4">
            <div>
              <p className="mb-1 font-medium">{editingVisit.hospitalName}</p>
              <p className="text-sm text-gray-500">
                방문일: {new Date(editingVisit.visitStartTime).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">담당 직원: {editingVisit.employeeName}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-status">계약 상태</Label>
              <Select
                value={editingVisit.contractStatus}
                onValueChange={(value) => setEditingVisit({ ...editingVisit, contractStatus: value })}
              >
                <SelectTrigger id="contract-status">
                  <SelectValue placeholder="계약 상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">계약 없음</SelectItem>
                  <SelectItem value="pending">계약 진행 중</SelectItem>
                  <SelectItem value="completed">계약 완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(editingVisit.contractStatus === "pending" || editingVisit.contractStatus === "completed") && (
              <div className="space-y-2">
                <Label htmlFor="contract-amount">계약 금액</Label>
                <Input
                  id="contract-amount"
                  type="number"
                  value={editingVisit.contractAmount || ""}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      contractAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="금액을 입력하세요"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                취소
              </Button>
              <Button onClick={handleSaveEdit}>저장</Button>
            </div>
          </div>
        </SimpleModal>
      )}
    </div>
  )
}
