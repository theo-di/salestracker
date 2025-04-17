"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import MainApp from "@/components/main-app"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"
import type { Group } from "@/types/group"

export default function Home() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ id: string; username: string; isAdmin: boolean; password: string } | null>(null)
  const [checkinTime, setCheckinTime] = useState<string>("")
  const [visits, setVisits] = useState<Visit[]>([])
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "admin",
      name: "관리자",
      phone: "010-0000-0000",
      email: "admin@example.com",
      region: "전체",
      position: "관리자",
      password: "admin123",
    },
  ])
  const [groups, setGroups] = useState<Group[]>([])

  // 방문 데이터 생성 시 날짜 객체가 제대로 생성되는지 확인
  const handleLogin = (username: string, password: string) => {
    // 기본 관리자 계정
    if (username === "admin" && password === "admin123") {
      const now = new Date()
      const formattedTime = now.toLocaleString("ko-KR")

      setUser({ id: "admin", username: "관리자", isAdmin: true, password: "admin123" })
      setCheckinTime(formattedTime)
      setIsLoggedIn(true)

      // 테스트용 방문 데이터 생성
      if (visits.length === 0) {
        const testVisits: Visit[] = [
          {
            id: "test-visit-1",
            hospitalName: "테스트 병원 1",
            hospitalType: "new",
            contactName: "김담당",
            contactPhone: "010-1234-5678",
            visitStartTime: new Date(),
            visitEndTime: new Date(new Date().getTime() + 60 * 60 * 1000),
            visitNotes: "테스트 방문",
            contractStatus: "completed",
            contractAmount: 1000000,
            location: "서울시 강남구",
            latitude: 37.5,
            longitude: 127.0,
            createdAt: new Date(),
            employeeId: "admin",
            employeeName: "관리자",
          },
          {
            id: "test-visit-2",
            hospitalName: "테스트 병원 2",
            hospitalType: "existing",
            contactName: "이담당",
            contactPhone: "010-2345-6789",
            visitStartTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            visitEndTime: new Date(new Date().getTime() - 23 * 60 * 60 * 1000),
            visitNotes: "테스트 방문 2",
            contractStatus: "pending",
            contractAmount: 500000,
            location: "서울시 서초구",
            latitude: 37.4,
            longitude: 127.1,
            createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            employeeId: "admin",
            employeeName: "관리자",
          },
        ]

        setVisits(testVisits)
        console.log("테스트 방문 데이터 생성:", testVisits.length, "건")
      }

      toast({
        title: "출근 완료",
        description: `관리자님, 환영합니다! 출근 시간: ${formattedTime}`,
      })

      return true
    }

    // 등록된 직원 계정 확인
    const employee = employees.find((emp) => emp.id === username && emp.password === password)

    if (employee) {
      const now = new Date()
      const formattedTime = now.toLocaleString("ko-KR")

      setUser({
        id: employee.id,
        username: employee.name,
        isAdmin: false,
        password: employee.password,
      })
      setCheckinTime(formattedTime)
      setIsLoggedIn(true)

      toast({
        title: "출근 완료",
        description: `${employee.name}님, 환영합니다! 출근 시간: ${formattedTime}`,
      })

      return true
    }

    return false
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)

    toast({
      title: "퇴근 완료",
      description: "성공적으로 로그아웃되었습니다. 수고하셨습니다!",
    })
  }

  const handlePasswordChange = (userId: string, newPassword: string) => {
    if (user && user.id === userId) {
      // 현재 로그인한 사용자의 비밀번호 변경
      setUser({
        ...user,
        password: newPassword,
      })
    }

    // 직원 목록에서도 비밀번호 업데이트
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) => (emp.id === userId ? { ...emp, password: newPassword } : emp)),
    )

    toast({
      title: "비밀번호 변경 완료",
      description: "비밀번호가 성공적으로 변경되었습니다.",
    })
  }

  const addVisit = (visit: Visit) => {
    setVisits([visit, ...visits])
  }

  const updateVisit = (updatedVisit: Visit) => {
    setVisits((prevVisits) => prevVisits.map((visit) => (visit.id === updatedVisit.id ? updatedVisit : visit)))
  }

  // 직원 관리 함수
  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee])
  }

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prevEmployees) => prevEmployees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  const deleteEmployee = (employeeId: string) => {
    setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== employeeId))
  }

  // 그룹 관리 함수
  const addGroup = (group: Group) => {
    setGroups([...groups, group])
  }

  const updateGroup = (updatedGroup: Group) => {
    setGroups((prevGroups) => prevGroups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)))
  }

  const deleteGroup = (groupId: string) => {
    setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId))
  }

  return (
    <main>
      {isLoggedIn && user ? (
        <MainApp
          user={user}
          checkinTime={checkinTime}
          onLogout={handleLogout}
          visits={visits}
          employees={employees}
          groups={groups}
          onAddVisit={addVisit}
          onUpdateVisit={updateVisit}
          onPasswordChange={handlePasswordChange}
          onAddEmployee={addEmployee}
          onUpdateEmployee={updateEmployee}
          onDeleteEmployee={deleteEmployee}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster />
    </main>
  )
}
