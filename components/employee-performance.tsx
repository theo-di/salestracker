"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"

interface EmployeePerformanceProps {
  visits: Visit[]
  employees: Employee[]
}

export default function EmployeePerformance({ visits, employees }: EmployeePerformanceProps) {
  const [period, setPeriod] = useState("month")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")

  // 기간에 따른 방문 필터링
  const filterVisitsByPeriod = (visits: Visit[]): Visit[] => {
    const today = new Date()
    const startDate = new Date()

    if (period === "week") {
      startDate.setDate(today.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(today.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(today.getMonth() - 3)
    } else if (period === "year") {
      startDate.setFullYear(today.getFullYear() - 1)
    }

    return visits.filter((visit) => visit.visitStartTime >= startDate)
  }

  // 직원별 성과 계산
  const calculateEmployeePerformance = () => {
    const filteredVisits = filterVisitsByPeriod(visits)

    // 직원별 성과 데이터 생성
    const employeePerformance = employees.map((employee) => {
      // 해당 직원의 방문 데이터
      const employeeVisits = filteredVisits.filter((visit) => visit.employeeId === employee.id)

      // 방문 수
      const visitCount = employeeVisits.length

      // 계약 수
      const contractCount = employeeVisits.filter((visit) => visit.contractStatus === "completed").length

      // 계약 금액 합계
      const totalAmount = employeeVisits
        .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
        .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

      // 전환율
      const conversionRate = visitCount > 0 ? (contractCount / visitCount) * 100 : 0

      return {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        region: employee.region,
        visitCount,
        contractCount,
        totalAmount,
        conversionRate,
      }
    })

    // 방문 수 기준 내림차순 정렬
    return employeePerformance.sort((a, b) => b.visitCount - a.visitCount)
  }

  // 전체 성과 요약 계산
  const calculateTotalPerformance = () => {
    const filteredVisits = filterVisitsByPeriod(visits)

    // 전체 방문 수
    const totalVisits = filteredVisits.length

    // 전체 계약 수
    const totalContracts = filteredVisits.filter((visit) => visit.contractStatus === "completed").length

    // 전체 계약 금액
    const totalAmount = filteredVisits
      .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
      .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)

    // 전체 전환율
    const totalConversionRate = totalVisits > 0 ? (totalContracts / totalVisits) * 100 : 0

    // 신규 병원 방문 수
    const newHospitalVisits = filteredVisits.filter((visit) => visit.hospitalType === "new").length

    // 기존 병원 방문 수
    const existingHospitalVisits = filteredVisits.filter((visit) => visit.hospitalType === "existing").length

    return {
      totalVisits,
      totalContracts,
      totalAmount,
      totalConversionRate,
      newHospitalVisits,
      existingHospitalVisits,
    }
  }

  // 지역별 성과 계산
  const calculateRegionPerformance = () => {
    const filteredVisits = filterVisitsByPeriod(visits)

    // 지역별 방문 데이터 그룹화
    const regionMap = new Map<string, { visits: number; contracts: number; amount: number }>()

    filteredVisits.forEach((visit) => {
      const region = visit.location.split(" ")[1] || visit.location // "서울시 강남구" -> "강남구"

      if (!regionMap.has(region)) {
        regionMap.set(region, { visits: 0, contracts: 0, amount: 0 })
      }

      const regionData = regionMap.get(region)!
      regionData.visits++

      if (visit.contractStatus === "completed") {
        regionData.contracts++
        regionData.amount += visit.contractAmount || 0
      }
    })

    // 지역별 성과 데이터 배열로 변환
    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      visits: data.visits,
      contracts: data.contracts,
      amount: data.amount,
      conversionRate: data.visits > 0 ? (data.contracts / data.visits) * 100 : 0,
    }))
  }

  const employeePerformance = calculateEmployeePerformance()
  const totalPerformance = calculateTotalPerformance()
  const regionPerformance = calculateRegionPerformance()

  // 선택된 직원의 성과 데이터
  const selectedEmployeeData =
    selectedEmployee === "all" ? null : employeePerformance.find((emp) => emp.id === selectedEmployee)

  // 선택된 직원의 방문 데이터
  const selectedEmployeeVisits =
    selectedEmployee === "all"
      ? filterVisitsByPeriod(visits)
      : filterVisitsByPeriod(visits).filter((visit) => visit.employeeId === selectedEmployee)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">성과 분석 대시보드</h2>

      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="overview">전체 성과</TabsTrigger>
            <TabsTrigger value="employee">직원별 성과</TabsTrigger>
            <TabsTrigger value="region">지역별 성과</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">최근 1주</SelectItem>
              <SelectItem value="month">최근 1개월</SelectItem>
              <SelectItem value="quarter">최근 3개월</SelectItem>
              <SelectItem value="year">최근 1년</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === "employee" && (
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="직원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직원</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <TabsContent value="overview" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <CardTitle className="text-lg mb-2">총 방문 수</CardTitle>
              <p className="text-4xl font-bold text-blue-600 mb-1">{totalPerformance.totalVisits}</p>
              <p className="text-gray-500">
                {period === "week"
                  ? "최근 1주"
                  : period === "month"
                    ? "최근 1개월"
                    : period === "quarter"
                      ? "최근 3개월"
                      : "최근 1년"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CardTitle className="text-lg mb-2">계약 성사 건수</CardTitle>
              <p className="text-4xl font-bold text-green-600 mb-1">{totalPerformance.totalContracts}</p>
              <p className="text-gray-500">
                {period === "week"
                  ? "최근 1주"
                  : period === "month"
                    ? "최근 1개월"
                    : period === "quarter"
                      ? "최근 3개월"
                      : "최근 1년"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CardTitle className="text-lg mb-2">계약 금액</CardTitle>
              <p className="text-4xl font-bold text-purple-600 mb-1">
                {(totalPerformance.totalAmount / 10000).toFixed(0)}만원
              </p>
              <p className="text-gray-500">
                {period === "week"
                  ? "최근 1주"
                  : period === "month"
                    ? "최근 1개월"
                    : period === "quarter"
                      ? "최근 3개월"
                      : "최근 1년"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CardTitle className="text-lg mb-2">전환율</CardTitle>
              <p className="text-4xl font-bold text-red-600 mb-1">{totalPerformance.totalConversionRate.toFixed(1)}%</p>
              <p className="text-gray-500">
                {period === "week"
                  ? "최근 1주"
                  : period === "month"
                    ? "최근 1개월"
                    : period === "quarter"
                      ? "최근 3개월"
                      : "최근 1년"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>직원별 성과 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>직원명</TableHead>
                      <TableHead>방문 수</TableHead>
                      <TableHead>계약 수</TableHead>
                      <TableHead>전환율</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.visitCount}</TableCell>
                        <TableCell>{employee.contractCount}</TableCell>
                        <TableCell>{employee.conversionRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>방문 유형 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="flex justify-center space-x-8 mb-6">
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-2 mx-auto">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{totalPerformance.newHospitalVisits}</div>
                          <div className="text-sm text-blue-600">방문</div>
                        </div>
                      </div>
                      <p className="font-medium">신규 병원</p>
                      <p className="text-sm text-gray-500">
                        {totalPerformance.totalVisits > 0
                          ? ((totalPerformance.newHospitalVisits / totalPerformance.totalVisits) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mb-2 mx-auto">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {totalPerformance.existingHospitalVisits}
                          </div>
                          <div className="text-sm text-green-600">방문</div>
                        </div>
                      </div>
                      <p className="font-medium">기존 병원</p>
                      <p className="text-sm text-gray-500">
                        {totalPerformance.totalVisits > 0
                          ? ((totalPerformance.existingHospitalVisits / totalPerformance.totalVisits) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{
                        width: `${
                          totalPerformance.totalVisits > 0
                            ? (totalPerformance.newHospitalVisits / totalPerformance.totalVisits) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>신규 병원</span>
                    <span>기존 병원</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>지역별 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>지역</TableHead>
                    <TableHead>방문 수</TableHead>
                    <TableHead>계약 수</TableHead>
                    <TableHead>계약 금액</TableHead>
                    <TableHead>전환율</TableHead>
                    <TableHead>성과 지표</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionPerformance.map((region, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{region.region}</TableCell>
                      <TableCell>{region.visits}</TableCell>
                      <TableCell>{region.contracts}</TableCell>
                      <TableCell>{(region.amount / 10000).toFixed(0)}만원</TableCell>
                      <TableCell>{region.conversionRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, region.conversionRate)}%` }}
                          ></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="employee" className="mt-0">
        {selectedEmployee === "all" ? (
          <Card>
            <CardHeader>
              <CardTitle>직원별 성과 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>직원명</TableHead>
                      <TableHead>직급</TableHead>
                      <TableHead>담당 지역</TableHead>
                      <TableHead>방문 수</TableHead>
                      <TableHead>계약 수</TableHead>
                      <TableHead>계약 금액</TableHead>
                      <TableHead>전환율</TableHead>
                      <TableHead>성과 지표</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.region}</TableCell>
                        <TableCell>{employee.visitCount}</TableCell>
                        <TableCell>{employee.contractCount}</TableCell>
                        <TableCell>{(employee.totalAmount / 10000).toFixed(0)}만원</TableCell>
                        <TableCell>{employee.conversionRate.toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, employee.conversionRate)}%` }}
                            ></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">방문 수 비교</h3>
                  <div className="h-[300px] bg-gray-50 rounded-md p-4">
                    <div className="flex flex-col h-full justify-end">
                      <div className="flex items-end justify-around h-[220px]">
                        {employeePerformance.slice(0, 5).map((employee) => (
                          <div key={employee.id} className="flex flex-col items-center">
                            <div
                              className="w-12 bg-blue-500 rounded-t-md flex items-end justify-center"
                              style={{
                                height: `${Math.max(
                                  20,
                                  (employee.visitCount / Math.max(...employeePerformance.map((e) => e.visitCount))) *
                                    200,
                                )}px`,
                              }}
                            >
                              <span className="text-white text-xs font-bold py-1">{employee.visitCount}</span>
                            </div>
                            <span className="text-xs mt-2 text-center w-14 truncate" title={employee.name}>
                              {employee.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-[1px] bg-gray-300 mt-2"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">전환율 비교</h3>
                  <div className="h-[300px] bg-gray-50 rounded-md p-4">
                    <div className="flex flex-col h-full justify-end">
                      <div className="flex items-end justify-around h-[220px]">
                        {employeePerformance.slice(0, 5).map((employee) => (
                          <div key={employee.id} className="flex flex-col items-center">
                            <div
                              className="w-12 bg-green-500 rounded-t-md flex items-end justify-center"
                              style={{
                                height: `${Math.max(20, (employee.conversionRate / 100) * 200)}px`,
                              }}
                            >
                              <span className="text-white text-xs font-bold py-1">
                                {employee.conversionRate.toFixed(0)}%
                              </span>
                            </div>
                            <span className="text-xs mt-2 text-center w-14 truncate" title={employee.name}>
                              {employee.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-[1px] bg-gray-300 mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedEmployeeData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CardTitle className="text-lg mb-2">방문 수</CardTitle>
                      <p className="text-4xl font-bold text-blue-600 mb-1">{selectedEmployeeData.visitCount}</p>
                      <p className="text-gray-500">
                        {period === "week"
                          ? "최근 1주"
                          : period === "month"
                            ? "최근 1개월"
                            : period === "quarter"
                              ? "최근 3개월"
                              : "최근 1년"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <CardTitle className="text-lg mb-2">계약 건수</CardTitle>
                      <p className="text-4xl font-bold text-green-600 mb-1">{selectedEmployeeData.contractCount}</p>
                      <p className="text-gray-500">
                        {period === "week"
                          ? "최근 1주"
                          : period === "month"
                            ? "최근 1개월"
                            : period === "quarter"
                              ? "최근 3개월"
                              : "최근 1년"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <CardTitle className="text-lg mb-2">계약 금액</CardTitle>
                      <p className="text-4xl font-bold text-purple-600 mb-1">
                        {(selectedEmployeeData.totalAmount / 10000).toFixed(0)}만원
                      </p>
                      <p className="text-gray-500">
                        {period === "week"
                          ? "최근 1주"
                          : period === "month"
                            ? "최근 1개월"
                            : period === "quarter"
                              ? "최근 3개월"
                              : "최근 1년"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <CardTitle className="text-lg mb-2">전환율</CardTitle>
                      <p className="text-4xl font-bold text-red-600 mb-1">
                        {selectedEmployeeData.conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-gray-500">
                        {period === "week"
                          ? "최근 1주"
                          : period === "month"
                            ? "최근 1개월"
                            : period === "quarter"
                              ? "최근 3개월"
                              : "최근 1년"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>방문 유형 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="w-full max-w-md">
                          <div className="flex justify-center space-x-8 mb-6">
                            <div className="text-center">
                              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2 mx-auto">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {selectedEmployeeVisits.filter((v) => v.hospitalType === "new").length}
                                  </div>
                                  <div className="text-xs text-blue-600">방문</div>
                                </div>
                              </div>
                              <p className="font-medium">신규 병원</p>
                            </div>

                            <div className="text-center">
                              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2 mx-auto">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {selectedEmployeeVisits.filter((v) => v.hospitalType === "existing").length}
                                  </div>
                                  <div className="text-xs text-green-600">방문</div>
                                </div>
                              </div>
                              <p className="font-medium">기존 병원</p>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div
                              className="bg-blue-500 h-4 rounded-full"
                              style={{
                                width: `${
                                  selectedEmployeeVisits.length > 0
                                    ? (
                                        selectedEmployeeVisits.filter((v) => v.hospitalType === "new").length /
                                          selectedEmployeeVisits.length
                                      ) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>신규 병원</span>
                            <span>기존 병원</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>계약 상태 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="w-full max-w-md">
                          <div className="flex justify-center space-x-8 mb-6">
                            <div className="text-center">
                              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2 mx-auto">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {selectedEmployeeVisits.filter((v) => v.contractStatus === "completed").length}
                                  </div>
                                  <div className="text-xs text-green-600">계약</div>
                                </div>
                              </div>
                              <p className="font-medium">계약 완료</p>
                            </div>

                            <div className="text-center">
                              <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mb-2 mx-auto">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-yellow-600">
                                    {selectedEmployeeVisits.filter((v) => v.contractStatus === "pending").length}
                                  </div>
                                  <div className="text-xs text-yellow-600">계약</div>
                                </div>
                              </div>
                              <p className="font-medium">계약 진행 중</p>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div
                              className="bg-green-500 h-4 rounded-full"
                              style={{
                                width: `${
                                  selectedEmployeeVisits.length > 0
                                    ? (
                                        selectedEmployeeVisits.filter((v) => v.contractStatus === "completed").length /
                                          selectedEmployeeVisits.length
                                      ) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>계약 완료</span>
                            <span>미계약/진행 중</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{selectedEmployeeData.name} 직원의 최근 방문 기록</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>날짜</TableHead>
                            <TableHead>병원명</TableHead>
                            <TableHead>담당자</TableHead>
                            <TableHead>구분</TableHead>
                            <TableHead>계약상태</TableHead>
                            <TableHead>계약금액</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmployeeVisits.length > 0 ? (
                            selectedEmployeeVisits.map((visit) => (
                              <TableRow key={visit.id}>
                                <TableCell>{visit.visitStartTime.toLocaleDateString()}</TableCell>
                                <TableCell>{visit.hospitalName}</TableCell>
                                <TableCell>{visit.contactName}</TableCell>
                                <TableCell>{visit.hospitalType === "new" ? "신규" : "기존"}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      visit.contractStatus === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : visit.contractStatus === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {visit.contractStatus === "completed"
                                      ? "계약 완료"
                                      : visit.contractStatus === "pending"
                                        ? "계약 진행 중"
                                        : "계약 없음"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {visit.contractAmount ? `${(visit.contractAmount / 10000).toFixed(0)}만원` : "-"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                방문 기록이 없습니다.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="region" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>지역별 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-4">지역별 방문 수</h3>
                <div className="h-[300px] bg-gray-50 rounded-md p-4">
                  <div className="flex flex-col h-full justify-end">
                    <div className="flex items-end justify-around h-[220px]">
                      {regionPerformance.slice(0, 5).map((region, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-16 bg-blue-500 rounded-t-md flex items-end justify-center"
                            style={{
                              height: `${Math.max(20, (region.visits / Math.max(...regionPerformance.map((r) => r.visits))) * 200)}px`,
                            }}
                          >
                            <span className="text-white text-xs font-bold py-1">{region.visits}</span>
                          </div>
                          <span className="text-xs mt-2 text-center w-16 truncate" title={region.region}>
                            {region.region}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-[1px] bg-gray-300 mt-2"></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">지역별 계약 수</h3>
                <div className="h-[300px] bg-gray-50 rounded-md p-4">
                  <div className="flex flex-col h-full justify-end">
                    <div className="flex items-end justify-around h-[220px]">
                      {regionPerformance.slice(0, 5).map((region, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-16 bg-green-500 rounded-t-md flex items-end justify-center"
                            style={{
                              height: `${Math.max(
                                20,
                                (region.contracts / Math.max(...regionPerformance.map((r) => r.contracts || 1))) * 200,
                              )}px`,
                            }}
                          >
                            <span className="text-white text-xs font-bold py-1">{region.contracts}</span>
                          </div>
                          <span className="text-xs mt-2 text-center w-16 truncate" title={region.region}>
                            {region.region}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-[1px] bg-gray-300 mt-2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>지역</TableHead>
                    <TableHead>방문 수</TableHead>
                    <TableHead>계약 수</TableHead>
                    <TableHead>계약 금액</TableHead>
                    <TableHead>전환율</TableHead>
                    <TableHead>성과 지표</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionPerformance.map((region, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{region.region}</TableCell>
                      <TableCell>{region.visits}</TableCell>
                      <TableCell>{region.contracts}</TableCell>
                      <TableCell>{(region.amount / 10000).toFixed(0)}만원</TableCell>
                      <TableCell>{region.conversionRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, region.conversionRate)}%` }}
                          ></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}
