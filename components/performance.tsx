"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, BarChart3, Users, MapPin } from "lucide-react"
import type { Visit } from "@/types/visit"

// 방문 데이터의 날짜 처리를 개선하기 위해 다음 함수들을 수정합니다.

// 오늘 방문 수 계산 함수 수정
const countTodayVisits = (visits: Visit[]): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    // 방문 날짜가 Date 객체인지 확인하고 처리
    const visitDate = new Date(visit.visitStartTime)
    visitDate.setHours(0, 0, 0, 0)
    return visitDate.getTime() === today.getTime()
  }).length
}

// 이번 주 방문 수 계산 함수 수정
const countWeeklyVisits = (visits: Visit[]): number => {
  const today = new Date()
  const weekStart = new Date(today)
  const day = today.getDay() || 7 // 일요일이면 7로 처리
  weekStart.setDate(today.getDate() - day + 1) // 이번 주 월요일
  weekStart.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    // 방문 날짜가 Date 객체인지 확인하고 처리
    const visitDate = new Date(visit.visitStartTime)
    return visitDate >= weekStart
  }).length
}

// 이번 달 방문 수 계산 함수 수정
const countMonthlyVisits = (visits: Visit[]): number => {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    // 방문 날짜가 Date 객체인지 확인하고 처리
    const visitDate = new Date(visit.visitStartTime)
    return visitDate >= monthStart
  }).length
}

// 이번 달 계약 수 계산 함수 수정
const countMonthlyContracts = (visits: Visit[]): number => {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    // 방문 날짜가 Date 객체인지 확인하고 처리
    const visitDate = new Date(visit.visitStartTime)
    return visitDate >= monthStart && visit.contractStatus === "completed"
  }).length
}

const calculateConversionRate = (visits: number, contracts: number): number => {
  if (visits === 0) return 0
  return (contracts / visits) * 100
}

interface PerformanceProps {
  visits: Visit[]
}

export default function Performance({ visits }: PerformanceProps) {
  const [totalVisits, setTotalVisits] = useState(0)
  const [totalContracts, setTotalContracts] = useState(0)
  const [conversionRate, setConversionRate] = useState(0)
  const [visitChartPeriod, setVisitChartPeriod] = useState("month")
  const [contractChartPeriod, setContractChartPeriod] = useState("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")

  useEffect(() => {
    // 방문 데이터가 있는지 확인
    if (visits && visits.length > 0) {
      console.log("방문 데이터:", visits.length, "건")

      // 성과 통계 계산
      const monthlyVisits = countMonthlyVisits(visits)
      const monthlyContracts = countMonthlyContracts(visits)
      const rate = calculateConversionRate(monthlyVisits, monthlyContracts)

      console.log("월간 방문:", monthlyVisits, "건")
      console.log("월간 계약:", monthlyContracts, "건")
      console.log("전환율:", rate.toFixed(1), "%")

      setTotalVisits(monthlyVisits)
      setTotalContracts(monthlyContracts)
      setConversionRate(rate)
    } else {
      console.log("방문 데이터가 없습니다.")
      setTotalVisits(0)
      setTotalContracts(0)
      setConversionRate(0)
    }
  }, [visits])

  // 직원별 성과 계산
  const calculateEmployeePerformance = () => {
    if (!visits || visits.length === 0) {
      return []
    }

    // 직원 ID별로 그룹화
    const employeeMap = new Map<string, { name: string; visits: number; contracts: number; amount: number }>()

    visits.forEach((visit) => {
      if (!visit.employeeId || !visit.employeeName) {
        return // 직원 정보가 없는 방문은 건너뜀
      }

      if (!employeeMap.has(visit.employeeId)) {
        employeeMap.set(visit.employeeId, {
          name: visit.employeeName,
          visits: 0,
          contracts: 0,
          amount: 0,
        })
      }

      const empData = employeeMap.get(visit.employeeId)!
      empData.visits++

      if (visit.contractStatus === "completed") {
        empData.contracts++
        empData.amount += visit.contractAmount || 0
      }
    })

    // 배열로 변환하여 방문 수 기준 내림차순 정렬
    return Array.from(employeeMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        visits: data.visits,
        contracts: data.contracts,
        amount: data.amount,
        conversionRate: data.visits > 0 ? (data.contracts / data.visits) * 100 : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
  }

  // 지역별 성과 계산
  const calculateRegionPerformance = () => {
    if (!visits || visits.length === 0) {
      return []
    }

    // 지역별로 그룹화
    const regionMap = new Map<string, { visits: number; contracts: number; amount: number }>()

    visits.forEach((visit) => {
      if (!visit.location) {
        return // 위치 정보가 없는 방문은 건너뜀
      }

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

    // 배열로 변환하여 방문 수 기준 내림차순 정렬
    return Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        visits: data.visits,
        contracts: data.contracts,
        amount: data.amount,
        conversionRate: data.visits > 0 ? (data.contracts / data.visits) * 100 : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
  }

  const employeePerformance = calculateEmployeePerformance()
  const regionPerformance = calculateRegionPerformance()

  // 선택된 직원의 방문 데이터
  const filteredVisitsByEmployee =
    selectedEmployee === "all" ? visits : visits.filter((visit) => visit.employeeId === selectedEmployee)

  // 선택된 지역의 방문 데이터
  const filteredVisitsByRegion =
    selectedRegion === "all" ? visits : visits.filter((visit) => visit.location.includes(selectedRegion))

  const handleExportReport = () => {
    alert("리포트 내보내기 기능은 준비 중입니다.")
  }

  // 고유한 지역 목록 추출
  const uniqueRegions = [
    ...new Set(
      visits.map((visit) => {
        const region = visit.location.split(" ")[1] || visit.location
        return region
      }),
    ),
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">성과 분석</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            전체 성과
          </TabsTrigger>
          <TabsTrigger value="employee" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            직원별 성과
          </TabsTrigger>
          <TabsTrigger value="region" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            지역별 성과
          </TabsTrigger>
        </TabsList>

        {/* 전체 성과 대시보드 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <CardTitle className="text-lg mb-2">총 방문 수</CardTitle>
                <p className="text-4xl font-bold text-blue-600 mb-1">{totalVisits}</p>
                <p className="text-gray-500">이번 달</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CardTitle className="text-lg mb-2">계약 성사 건수</CardTitle>
                <p className="text-4xl font-bold text-green-600 mb-1">{totalContracts}</p>
                <p className="text-gray-500">이번 달</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CardTitle className="text-lg mb-2">계약 전환율</CardTitle>
                <p className="text-4xl font-bold text-red-600 mb-1">{conversionRate.toFixed(1)}%</p>
                <p className="text-gray-500">이번 달</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>방문 추이</CardTitle>
                  <Select value={visitChartPeriod} onValueChange={setVisitChartPeriod}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">주간</SelectItem>
                      <SelectItem value="month">월간</SelectItem>
                      <SelectItem value="year">연간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="w-full h-full p-4">
                    <div className="flex justify-between items-end h-[180px] mb-2">
                      {/* 간단한 막대 차트 구현 */}
                      {[
                        {
                          label: "1주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 7)
                            return v.visitStartTime >= date
                          }).length,
                        },
                        {
                          label: "2주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 14)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 7)
                            return v.visitStartTime >= date && v.visitStartTime <= date2
                          }).length,
                        },
                        {
                          label: "3주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 21)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 14)
                            return v.visitStartTime >= date && v.visitStartTime <= date2
                          }).length,
                        },
                        {
                          label: "4주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 28)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 21)
                            return v.visitStartTime >= date && v.visitStartTime <= date2
                          }).length,
                        },
                        {
                          label: "이번주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - date.getDay())
                            return v.visitStartTime >= date
                          }).length,
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 bg-blue-500 rounded-t-md"
                            style={{
                              height: `${Math.max(20, (item.value / 10) * 150)}px`,
                              minHeight: "20px",
                            }}
                          >
                            <div className="text-white text-center font-bold">{item.value}</div>
                          </div>
                          <div className="text-xs mt-2">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-500">기간별 방문 수</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>계약 추이</CardTitle>
                  <Select value={contractChartPeriod} onValueChange={setContractChartPeriod}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">주간</SelectItem>
                      <SelectItem value="month">월간</SelectItem>
                      <SelectItem value="year">연간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="w-full h-full p-4">
                    <div className="flex justify-between items-end h-[180px] mb-2">
                      {/* 간단한 막대 차트 구현 */}
                      {[
                        {
                          label: "1주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 7)
                            return v.visitStartTime >= date && v.contractStatus === "completed"
                          }).length,
                        },
                        {
                          label: "2주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 14)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 7)
                            return (
                              v.visitStartTime >= date && v.visitStartTime <= date2 && v.contractStatus === "completed"
                            )
                          }).length,
                        },
                        {
                          label: "3주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 21)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 14)
                            return (
                              v.visitStartTime >= date && v.visitStartTime <= date2 && v.contractStatus === "completed"
                            )
                          }).length,
                        },
                        {
                          label: "4주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - 28)
                            const date2 = new Date()
                            date2.setDate(date2.getDate() - 21)
                            return (
                              v.visitStartTime >= date && v.visitStartTime <= date2 && v.contractStatus === "completed"
                            )
                          }).length,
                        },
                        {
                          label: "이번주",
                          value: visits.filter((v) => {
                            const date = new Date()
                            date.setDate(date.getDate() - date.getDay())
                            return v.visitStartTime >= date && v.contractStatus === "completed"
                          }).length,
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-12 bg-green-500 rounded-t-md"
                            style={{
                              height: `${Math.max(20, (item.value / 5) * 150)}px`,
                              minHeight: "20px",
                            }}
                          >
                            <div className="text-white text-center font-bold">{item.value}</div>
                          </div>
                          <div className="text-xs mt-2">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-500">기간별 계약 수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>성과 요약 리포트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>기간</TableHead>
                      <TableHead>방문 수</TableHead>
                      <TableHead>신규 병원</TableHead>
                      <TableHead>기존 병원</TableHead>
                      <TableHead>계약 건수</TableHead>
                      <TableHead>전환율</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>오늘</TableCell>
                      <TableCell>{countTodayVisits(visits)}</TableCell>
                      <TableCell>{countTodayVisits(visits.filter((v) => v.hospitalType === "new"))}</TableCell>
                      <TableCell>{countTodayVisits(visits.filter((v) => v.hospitalType === "existing"))}</TableCell>
                      <TableCell>{countTodayVisits(visits.filter((v) => v.contractStatus === "completed"))}</TableCell>
                      <TableCell>
                        {calculateConversionRate(
                          countTodayVisits(visits),
                          countTodayVisits(visits.filter((v) => v.contractStatus === "completed")),
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>이번 주</TableCell>
                      <TableCell>{countWeeklyVisits(visits)}</TableCell>
                      <TableCell>{countWeeklyVisits(visits.filter((v) => v.hospitalType === "new"))}</TableCell>
                      <TableCell>{countWeeklyVisits(visits.filter((v) => v.hospitalType === "existing"))}</TableCell>
                      <TableCell>{countWeeklyVisits(visits.filter((v) => v.contractStatus === "completed"))}</TableCell>
                      <TableCell>
                        {calculateConversionRate(
                          countWeeklyVisits(visits),
                          countWeeklyVisits(visits.filter((v) => v.contractStatus === "completed")),
                        ).toFixed(1)}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>이번 달</TableCell>
                      <TableCell>{totalVisits}</TableCell>
                      <TableCell>{countMonthlyVisits(visits.filter((v) => v.hospitalType === "new"))}</TableCell>
                      <TableCell>{countMonthlyVisits(visits.filter((v) => v.hospitalType === "existing"))}</TableCell>
                      <TableCell>{totalContracts}</TableCell>
                      <TableCell>{conversionRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 직원별 성과 대시보드 */}
        <TabsContent value="employee" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">직원별 성과 분석</h3>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="직원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직원</SelectItem>
                {employeePerformance.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee === "all" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">총 직원 수</CardTitle>
                    <p className="text-4xl font-bold text-blue-600 mb-1">{employeePerformance.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">평균 방문 수</CardTitle>
                    <p className="text-4xl font-bold text-green-600 mb-1">
                      {employeePerformance.length > 0
                        ? (
                            employeePerformance.reduce((sum, emp) => sum + emp.visits, 0) / employeePerformance.length
                          ).toFixed(1)
                        : "0"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">평균 전환율</CardTitle>
                    <p className="text-4xl font-bold text-red-600 mb-1">
                      {employeePerformance.length > 0
                        ? (
                            employeePerformance.reduce((sum, emp) => sum + emp.conversionRate, 0) /
                            employeePerformance.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>

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
                            <TableCell>{employee.visits}</TableCell>
                            <TableCell>{employee.contracts}</TableCell>
                            <TableCell>{(employee.amount / 10000).toFixed(0)}만원</TableCell>
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
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>방문 수 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-50 rounded-md p-4">
                      <div className="flex flex-col h-full justify-end">
                        <div className="flex items-end justify-around h-[220px]">
                          {employeePerformance.slice(0, 5).map((employee) => (
                            <div key={employee.id} className="flex flex-col items-center">
                              <div
                                className="w-16 bg-blue-500 rounded-t-md flex items-end justify-center"
                                style={{
                                  height: `${Math.max(
                                    20,
                                    (employee.visits / Math.max(...employeePerformance.map((e) => e.visits))) * 200,
                                  )}px`,
                                }}
                              >
                                <span className="text-white text-xs font-bold py-1">{employee.visits}</span>
                              </div>
                              <span className="text-xs mt-2 text-center w-16 truncate" title={employee.name}>
                                {employee.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="h-[1px] bg-gray-300 mt-2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>전환율 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-50 rounded-md p-4">
                      <div className="flex flex-col h-full justify-end">
                        <div className="flex items-end justify-around h-[220px]">
                          {employeePerformance.slice(0, 5).map((employee) => (
                            <div key={employee.id} className="flex flex-col items-center">
                              <div
                                className="w-16 bg-green-500 rounded-t-md flex items-end justify-center"
                                style={{
                                  height: `${Math.max(20, (employee.conversionRate / 100) * 200)}px`,
                                }}
                              >
                                <span className="text-white text-xs font-bold py-1">
                                  {employee.conversionRate.toFixed(0)}%
                                </span>
                              </div>
                              <span className="text-xs mt-2 text-center w-16 truncate" title={employee.name}>
                                {employee.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="h-[1px] bg-gray-300 mt-2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // 선택된 직원의 성과 대시보드
            <>
              {employeePerformance
                .filter((emp) => emp.id === selectedEmployee)
                .map((employee) => (
                  <div key={employee.id} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">직원명</CardTitle>
                          <p className="text-2xl font-bold text-gray-800 mb-1">{employee.name}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">방문 수</CardTitle>
                          <p className="text-4xl font-bold text-blue-600 mb-1">{employee.visits}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">계약 수</CardTitle>
                          <p className="text-4xl font-bold text-green-600 mb-1">{employee.contracts}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">전환율</CardTitle>
                          <p className="text-4xl font-bold text-red-600 mb-1">{employee.conversionRate.toFixed(1)}%</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>{employee.name} 직원의 방문 기록</CardTitle>
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
                              {filteredVisitsByEmployee.length > 0 ? (
                                filteredVisitsByEmployee.map((visit) => (
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
                  </div>
                ))}
            </>
          )}
        </TabsContent>

        {/* 지역별 성과 대시보드 */}
        <TabsContent value="region" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">지역별 성과 분석</h3>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRegion === "all" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">총 지역 수</CardTitle>
                    <p className="text-4xl font-bold text-blue-600 mb-1">{uniqueRegions.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">평균 방문 수</CardTitle>
                    <p className="text-4xl font-bold text-green-600 mb-1">
                      {regionPerformance.length > 0
                        ? (
                            regionPerformance.reduce((sum, region) => sum + region.visits, 0) / regionPerformance.length
                          ).toFixed(1)
                        : "0"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <CardTitle className="text-lg mb-2">평균 전환율</CardTitle>
                    <p className="text-4xl font-bold text-red-600 mb-1">
                      {regionPerformance.length > 0
                        ? (
                            regionPerformance.reduce((sum, region) => sum + region.conversionRate, 0) /
                            regionPerformance.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>지역별 성과 비교</CardTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>방문 수 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-50 rounded-md p-4">
                      <div className="flex flex-col h-full justify-end">
                        <div className="flex items-end justify-around h-[220px]">
                          {regionPerformance.slice(0, 5).map((region, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div
                                className="w-16 bg-blue-500 rounded-t-md flex items-end justify-center"
                                style={{
                                  height: `${Math.max(
                                    20,
                                    (region.visits / Math.max(...regionPerformance.map((r) => r.visits))) * 200,
                                  )}px`,
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>전환율 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-50 rounded-md p-4">
                      <div className="flex flex-col h-full justify-end">
                        <div className="flex items-end justify-around h-[220px]">
                          {regionPerformance.slice(0, 5).map((region, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div
                                className="w-16 bg-green-500 rounded-t-md flex items-end justify-center"
                                style={{
                                  height: `${Math.max(20, (region.conversionRate / 100) * 200)}px`,
                                }}
                              >
                                <span className="text-white text-xs font-bold py-1">
                                  {region.conversionRate.toFixed(0)}%
                                </span>
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
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // 선택된 지역의 성과 대시보드
            <>
              {regionPerformance
                .filter((r) => r.region === selectedRegion)
                .map((region, index) => (
                  <div key={index} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">지역명</CardTitle>
                          <p className="text-2xl font-bold text-gray-800 mb-1">{region.region}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">방문 수</CardTitle>
                          <p className="text-4xl font-bold text-blue-600 mb-1">{region.visits}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">계약 수</CardTitle>
                          <p className="text-4xl font-bold text-green-600 mb-1">{region.contracts}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <CardTitle className="text-lg mb-2">전환율</CardTitle>
                          <p className="text-4xl font-bold text-red-600 mb-1">{region.conversionRate.toFixed(1)}%</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>{region.region} 지역의 방문 기록</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>날짜</TableHead>
                                <TableHead>병원명</TableHead>
                                <TableHead>담당 직원</TableHead>
                                <TableHead>구분</TableHead>
                                <TableHead>계약상태</TableHead>
                                <TableHead>계약금액</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredVisitsByRegion.length > 0 ? (
                                filteredVisitsByRegion.map((visit) => (
                                  <TableRow key={visit.id}>
                                    <TableCell>{visit.visitStartTime.toLocaleDateString()}</TableCell>
                                    <TableCell>{visit.hospitalName}</TableCell>
                                    <TableCell>{visit.employeeName}</TableCell>
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
                  </div>
                ))}
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          리포트 내보내기
        </Button>
      </div>
    </div>
  )
}
