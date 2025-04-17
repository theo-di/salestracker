"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import VisitCard from "@/components/visit-card"

// 간단한 방문 타입 정의
type Visit = {
  id: string
  hospitalName: string
  hospitalType: string
  contactName: string
  contactPhone: string
  visitStartTime: Date
  visitEndTime: Date
  visitNotes?: string
  contractStatus: string
  contractAmount?: number
  location: string
  createdAt: Date
  employeeId: string
  employeeName: string
}

// 간단한 통계 함수
const countTodayVisits = (visits: Visit[]): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    const visitDate = new Date(visit.visitStartTime)
    visitDate.setHours(0, 0, 0, 0)
    return visitDate.getTime() === today.getTime()
  }).length
}

const countWeeklyVisits = (visits: Visit[]): number => {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return visits.filter((visit) => visit.visitStartTime >= weekStart).length
}

const countMonthlyContracts = (visits: Visit[]): number => {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  return visits.filter((visit) => visit.visitStartTime >= monthStart && visit.contractStatus === "completed").length
}

interface DashboardProps {
  checkinTime: string
  visits: Visit[]
}

export default function Dashboard({ checkinTime, visits }: DashboardProps) {
  const [todayVisits, setTodayVisits] = useState(0)
  const [weeklyVisits, setWeeklyVisits] = useState(0)
  const [monthlyContracts, setMonthlyContracts] = useState(0)
  const [recentVisits, setRecentVisits] = useState<Visit[]>([])

  useEffect(() => {
    // 방문 통계 계산
    setTodayVisits(countTodayVisits(visits))
    setWeeklyVisits(countWeeklyVisits(visits))
    setMonthlyContracts(countMonthlyContracts(visits))

    // 최근 방문 5개 가져오기
    setRecentVisits(visits.slice(0, 5))
  }, [visits])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>

      <Alert className="mb-6 bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800 font-bold">출근 완료!</AlertTitle>
        <AlertDescription className="text-green-700">
          출근 시간: {checkinTime}
          <br />
          오늘도 좋은 하루 되세요!
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="transition-transform hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg mb-2">오늘 방문</CardTitle>
            <p className="text-4xl font-bold text-blue-600 mb-1">{todayVisits}</p>
            <p className="text-gray-500">병원</p>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg mb-2">이번 주 방문</CardTitle>
            <p className="text-4xl font-bold text-green-600 mb-1">{weeklyVisits}</p>
            <p className="text-gray-500">병원</p>
          </CardContent>
        </Card>

        <Card className="transition-transform hover:-translate-y-1">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg mb-2">이번 달 계약</CardTitle>
            <p className="text-4xl font-bold text-red-600 mb-1">{monthlyContracts}</p>
            <p className="text-gray-500">건</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 방문 기록</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            {recentVisits.length > 0 ? (
              <div className="space-y-4">
                {recentVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">방문 기록이 없습니다.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>오늘의 활동 요약</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length > 0 ? (
              <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">활동 요약 차트</p>
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mb-2">
                        <span className="font-bold">{visits.filter((v) => v.hospitalType === "new").length}</span>
                      </div>
                      <p className="text-xs">신규 병원</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center mb-2">
                        <span className="font-bold">{visits.filter((v) => v.hospitalType === "existing").length}</span>
                      </div>
                      <p className="text-xs">기존 병원</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center mb-2">
                        <span className="font-bold">
                          {visits.filter((v) => v.contractStatus === "completed").length}
                        </span>
                      </div>
                      <p className="text-xs">계약 완료</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">아직 등록된 방문 기록이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>방문 위치 지도</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length > 0 ? (
            <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center mb-2">
              <div className="text-center">
                <p className="text-gray-500 mb-4">방문 위치 지도</p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {visits.slice(0, 6).map((visit, index) => (
                    <div key={index} className="bg-white p-2 rounded shadow-sm text-xs">
                      <p className="font-medium truncate">{visit.hospitalName}</p>
                      <p className="text-gray-500 truncate">{visit.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center mb-2">
              <p className="text-gray-500">등록된 방문 위치가 없습니다.</p>
            </div>
          )}
          <p className="text-center text-gray-500 text-sm italic">
            * 실제 서비스에서는 지도 API를 통해 방문 위치가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
