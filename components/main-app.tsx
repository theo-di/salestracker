"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCircle, MapPin, Users, BarChart3, LogOut, Building2 } from "lucide-react"
import LoginPage from "./login-page"
import NewVisit from "./new-visit"
import EmployeeList from "./employee-list"
import EmployeeForm from "./employee-form"
import SimpleModal from "./simple-modal"
import PasswordChangeForm from "./password-change-form"
import Performance from "./performance"
import GroupManagement from "./group-management"
import VisitDetails from "./visit-details"
import VisitSchedule from "./visit-schedule"
import EmployeeVisits from "./employee-visits"
import EmployeePerformance from "./employee-performance"
import ExcelExport from "./excel-export"
import type { Employee, Group, Visit } from "../types"

export default function MainApp() {
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    id: string
    username: string
    isAdmin: boolean
  } | null>(null)

  // 직원 관리
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showEmployeeForm, setShowEmployeeForm] = useState<boolean>(false)
  const [employeeFormMode, setEmployeeFormMode] = useState<"add" | "edit">("add")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])

  // 방문 기록
  const [visits, setVisits] = useState<Visit[]>([])

  // 비밀번호 변경
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // 현재 활성화된 탭
  const [activeTab, setActiveTab] = useState("new-visit")
  const [adminSubTab, setAdminSubTab] = useState("employees")

  // 방문 상세 정보 모달
  const [showVisitDetails, setShowVisitDetails] = useState(false)
  const [selectedVisitType, setSelectedVisitType] = useState<"all" | "completed" | "amount">("all")
  const [selectedVisitData, setSelectedVisitData] = useState<Visit[]>([])

  useEffect(() => {
    // 로컬 스토리지에서 데이터 불러오기
    const loadDataFromLocalStorage = () => {
      try {
        // 직원 데이터 불러오기
        const savedEmployees = localStorage.getItem("employees")
        if (savedEmployees) {
          setEmployees(JSON.parse(savedEmployees))
        } else {
          // 더미 직원 데이터 (초기 데이터가 없을 경우에만)
          const initialEmployees: Employee[] = [
            {
              id: "HME0001",
              name: "홍길동",
              phone: "010-1234-5678",
              email: "hong@example.com",
              region: "서울",
              position: "과장",
              password: "password",
              groupId: "G1",
              groupName: "서울지점",
            },
            {
              id: "HME0002",
              name: "김영희",
              phone: "010-9876-5432",
              email: "kim@example.com",
              region: "부산",
              position: "대리",
              password: "password",
              groupId: "G2",
              groupName: "경남지점",
            },
            {
              id: "admin",
              name: "관리자",
              phone: "010-0000-0000",
              email: "admin@example.com",
              region: "전국",
              position: "이사",
              password: "admin123",
              groupId: "G5",
              groupName: "호남지점",
            },
            {
              id: "user",
              name: "일반사용자",
              phone: "010-1111-1111",
              email: "user@example.com",
              region: "서울",
              position: "사원",
              password: "password",
              groupId: "G1",
              groupName: "서울지점",
            },
          ]
          setEmployees(initialEmployees)
          localStorage.setItem("employees", JSON.stringify(initialEmployees))
        }

        // 그룹 데이터 불러오기
        const savedGroups = localStorage.getItem("groups")
        if (savedGroups) {
          setGroups(JSON.parse(savedGroups))
        } else {
          // 더미 그룹 데이터 (초기 데이터가 없을 경우에만)
          const initialGroups: Group[] = [
            { id: "G1", name: "서울지점" },
            { id: "G2", name: "경남지점" },
            { id: "G3", name: "인천지점" },
            { id: "G4", name: "용인지점" },
            { id: "G5", name: "호남지점" },
          ]
          setGroups(initialGroups)
          localStorage.setItem("groups", JSON.stringify(initialGroups))
        }

        // 방문 데이터 불러오기
        const savedVisits = localStorage.getItem("visits")
        if (savedVisits) {
          // 날짜 문자열을 Date 객체로 변환
          const parsedVisits = JSON.parse(savedVisits, (key, value) => {
            // visitStartTime, visitEndTime, createdAt 필드를 Date 객체로 변환
            if (key === "visitStartTime" || key === "visitEndTime" || key === "createdAt") {
              return new Date(value)
            }
            return value
          })
          setVisits(parsedVisits)
        } else {
          // 더미 방문 데이터 (초기 데이터가 없을 경우에만)
          const initialVisits: Visit[] = [
            {
              id: "1",
              hospitalName: "서울대학병원",
              hospitalType: "existing",
              contactName: "이상혁",
              contactPhone: "02-1234-5678",
              visitStartTime: new Date("2023-05-15T10:00:00"),
              visitEndTime: new Date("2023-05-15T11:30:00"),
              visitNotes: "신규 장비 도입 논의",
              contractStatus: "pending",
              contractAmount: 5000000,
              location: "서울시 종로구",
              latitude: 37.5665,
              longitude: 126.978,
              createdAt: new Date("2023-05-15T09:30:00"),
              employeeId: "HME0001",
              employeeName: "홍길동",
            },
            {
              id: "2",
              hospitalName: "부산메디컬센터",
              hospitalType: "new",
              contactName: "박지성",
              contactPhone: "051-987-6543",
              visitStartTime: new Date("2023-05-16T14:00:00"),
              visitEndTime: new Date("2023-05-16T15:30:00"),
              visitNotes: "제품 시연 및 가격 협상",
              contractStatus: "completed",
              contractAmount: 8000000,
              location: "부산시 해운대구",
              latitude: 35.1796,
              longitude: 129.0756,
              createdAt: new Date("2023-05-16T13:30:00"),
              employeeId: "HME0002",
              employeeName: "김영희",
            },
          ]
          setVisits(initialVisits)
          localStorage.setItem("visits", JSON.stringify(initialVisits))
        }

        // 로그인 정보 불러오기
        const savedUser = localStorage.getItem("currentUser")
        if (savedUser) {
          const user = JSON.parse(savedUser)
          setIsLoggedIn(true)
          setCurrentUser(user)
        }
      } catch (error) {
        console.error("로컬 스토리지에서 데이터를 불러오는 중 오류 발생:", error)
        // 오류 발생 시 기본 데이터 사용
        resetToDefaultData()
      }
    }

    // 기본 데이터로 초기화하는 함수
    const resetToDefaultData = () => {
      // 더미 직원 데이터
      const initialEmployees: Employee[] = [
        {
          id: "HME0001",
          name: "홍길동",
          phone: "010-1234-5678",
          email: "hong@example.com",
          region: "서울",
          position: "과장",
          password: "password",
          groupId: "G1",
          groupName: "서울지점",
        },
        {
          id: "HME0002",
          name: "김영희",
          phone: "010-9876-5432",
          email: "kim@example.com",
          region: "부산",
          position: "대리",
          password: "password",
          groupId: "G2",
          groupName: "경남지점",
        },
        {
          id: "admin",
          name: "관리자",
          phone: "010-0000-0000",
          email: "admin@example.com",
          region: "전국",
          position: "이사",
          password: "admin123",
          groupId: "G5",
          groupName: "호남지점",
        },
        {
          id: "user",
          name: "일반사용자",
          phone: "010-1111-1111",
          email: "user@example.com",
          region: "서울",
          position: "사원",
          password: "password",
          groupId: "G1",
          groupName: "서울지점",
        },
      ]
      setEmployees(initialEmployees)

      // 더미 그룹 데이터
      const initialGroups: Group[] = [
        { id: "G1", name: "서울지점" },
        { id: "G2", name: "경남지점" },
        { id: "G3", name: "인천지점" },
        { id: "G4", name: "용인지점" },
        { id: "G5", name: "호남지점" },
      ]
      setGroups(initialGroups)

      // 더미 방문 데이터
      const initialVisits: Visit[] = [
        {
          id: "1",
          hospitalName: "서울대학병원",
          hospitalType: "existing",
          contactName: "이상혁",
          contactPhone: "02-1234-5678",
          visitStartTime: new Date("2023-05-15T10:00:00"),
          visitEndTime: new Date("2023-05-15T11:30:00"),
          visitNotes: "신규 장비 도입 논의",
          contractStatus: "pending",
          contractAmount: 5000000,
          location: "서울시 종로구",
          latitude: 37.5665,
          longitude: 126.978,
          createdAt: new Date("2023-05-15T09:30:00"),
          employeeId: "HME0001",
          employeeName: "홍길동",
        },
        {
          id: "2",
          hospitalName: "부산메디컬센터",
          hospitalType: "new",
          contactName: "박지성",
          contactPhone: "051-987-6543",
          visitStartTime: new Date("2023-05-16T14:00:00"),
          visitEndTime: new Date("2023-05-16T15:30:00"),
          visitNotes: "제품 시연 및 가격 협상",
          contractStatus: "completed",
          contractAmount: 8000000,
          location: "부산시 해운대구",
          latitude: 35.1796,
          longitude: 129.0756,
          createdAt: new Date("2023-05-16T13:30:00"),
          employeeId: "HME0002",
          employeeName: "김영희",
        },
      ]
      setVisits(initialVisits)
    }

    // 로컬 스토리지에서 데이터 불러오기
    loadDataFromLocalStorage()
  }, [])

  // 직원 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }, [employees])

  // 그룹 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("groups", JSON.stringify(groups))
    }
  }, [groups])

  // 방문 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (visits.length > 0) {
      localStorage.setItem("visits", JSON.stringify(visits))
    }
  }, [visits])

  // 로그인 처리
  const handleLogin = (username: string, password: string) => {
    const employee = employees.find(
      (emp) => (emp.id === username || emp.email === username) && emp.password === password,
    )

    if (employee) {
      const user = {
        id: employee.id,
        username: employee.name,
        isAdmin: employee.id === "admin",
      }
      setIsLoggedIn(true)
      setCurrentUser(user)
      localStorage.setItem("currentUser", JSON.stringify(user))
      return true
    }
    return false
  }

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  // 직원 추가 모달 열기
  const handleAddEmployee = () => {
    setEmployeeFormMode("add")
    setSelectedEmployeeId(null)
    setShowEmployeeForm(true)
  }

  // 직원 수정 모달 열기
  const handleEditEmployee = (id: string) => {
    setEmployeeFormMode("edit")
    setSelectedEmployeeId(id)
    setShowEmployeeForm(true)
  }

  // 직원 삭제
  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter((employee) => employee.id !== id)
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  // 직원 추가/수정 제출
  const handleEmployeeSubmit = (employee: Employee) => {
    if (employeeFormMode === "add") {
      const newEmployees = [...employees, employee]
      setEmployees(newEmployees)
      localStorage.setItem("employees", JSON.stringify(newEmployees))
    } else {
      const updatedEmployees = employees.map((emp) => (emp.id === employee.id ? employee : emp))
      setEmployees(updatedEmployees)
      localStorage.setItem("employees", JSON.stringify(updatedEmployees))
    }
    setShowEmployeeForm(false)
  }

  // 방문 기록 추가
  const handleAddVisit = (visit: Visit) => {
    const newVisits = [...visits, visit]
    setVisits(newVisits)
    localStorage.setItem("visits", JSON.stringify(newVisits))
  }

  // 방문 기록 수정
  const handleUpdateVisit = (updatedVisit: Visit) => {
    const updatedVisits = visits.map((visit) => (visit.id === updatedVisit.id ? updatedVisit : visit))
    setVisits(updatedVisits)
    localStorage.setItem("visits", JSON.stringify(updatedVisits))
  }

  // 방문 기록 삭제
  const handleDeleteVisit = (visitId: string) => {
    const updatedVisits = visits.filter((visit) => visit.id !== visitId)
    setVisits(updatedVisits)
    localStorage.setItem("visits", JSON.stringify(updatedVisits))
  }

  // 비밀번호 변경
  const handlePasswordChange = (userId: string, newPassword: string) => {
    const updatedEmployees = employees.map((emp) => (emp.id === userId ? { ...emp, password: newPassword } : emp))
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
    setShowPasswordForm(false)
  }

  // 그룹 추가
  const handleAddGroup = (group: Group) => {
    const newGroups = [...groups, group]
    setGroups(newGroups)
    localStorage.setItem("groups", JSON.stringify(newGroups))
  }

  // 그룹 수정
  const handleEditGroup = (updatedGroup: Group) => {
    const updatedGroups = groups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group))
    setGroups(updatedGroups)
    localStorage.setItem("groups", JSON.stringify(updatedGroups))

    // 해당 그룹에 속한 직원들의 그룹명도 업데이트
    const updatedEmployees = employees.map((employee) =>
      employee.groupId === updatedGroup.id ? { ...employee, groupName: updatedGroup.name } : employee,
    )
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  // 그룹 삭제
  const handleDeleteGroup = (groupId: string) => {
    // 그룹 삭제
    const updatedGroups = groups.filter((group) => group.id !== groupId)
    setGroups(updatedGroups)
    localStorage.setItem("groups", JSON.stringify(updatedGroups))

    // 해당 그룹에 속한 직원들의 그룹 정보 제거
    const updatedEmployees = employees.map((employee) =>
      employee.groupId === groupId ? { ...employee, groupId: "", groupName: "" } : employee,
    )
    setEmployees(updatedEmployees)
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  // 방문 상세 정보 표시
  const handleShowVisitDetails = (type: "all" | "completed" | "amount") => {
    let filteredVisits: Visit[] = []

    // 현재 사용자의 방문 기록만 필터링 (관리자가 아닌 경우)
    const userVisits = currentUser?.isAdmin ? visits : visits.filter((visit) => visit.employeeId === currentUser?.id)

    if (type === "all") {
      filteredVisits = userVisits
    } else if (type === "completed") {
      filteredVisits = userVisits.filter((visit) => visit.contractStatus === "completed")
    } else if (type === "amount") {
      filteredVisits = userVisits.filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
    }

    setSelectedVisitType(type)
    setSelectedVisitData(filteredVisits)
    setShowVisitDetails(true)
  }

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">세일즈트래커</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserCircle className="h-5 w-5 mr-2 text-emerald-600" />
            <span className="font-medium">{currentUser?.username}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(true)}>
              비밀번호 변경
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="new-visit" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            신규 방문 등록
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            실적 분석
          </TabsTrigger>
          {currentUser?.isAdmin && (
            <TabsTrigger value="admin" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              관리자 메뉴
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="new-visit">
          <Card>
            <CardContent className="pt-6">
              <NewVisit onAddVisit={handleAddVisit} employees={employees} currentUser={currentUser!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="pt-6">
              <Performance
                visits={visits}
                employees={employees}
                groups={groups}
                currentUser={currentUser!}
                onShowDetails={handleShowVisitDetails}
              />
            </CardContent>
          </Card>

          <div className="mt-6">
            <VisitSchedule
              visits={visits.filter((visit) => visit.employeeId === currentUser?.id)}
              onUpdateVisit={handleUpdateVisit}
              onDeleteVisit={handleDeleteVisit}
            />
          </div>
        </TabsContent>

        {currentUser?.isAdmin && (
          <TabsContent value="admin">
            <Tabs value={adminSubTab} onValueChange={setAdminSubTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="employees" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  직원 관리
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  지점 관리
                </TabsTrigger>
                <TabsTrigger value="employee-visits" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  직원별 방문 기록
                </TabsTrigger>
                <TabsTrigger value="employee-performance" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  직원별 실적 분석
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employees">
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Button onClick={handleAddEmployee}>직원 추가</Button>
                    </div>
                    <EmployeeList employees={employees} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="groups">
                <Card>
                  <CardContent className="pt-6">
                    <GroupManagement
                      groups={groups}
                      onAddGroup={handleAddGroup}
                      onEditGroup={handleEditGroup}
                      onDeleteGroup={handleDeleteGroup}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employee-visits">
                <Card>
                  <CardContent className="pt-6">
                    <EmployeeVisits
                      visits={visits}
                      employees={employees}
                      onUpdateVisit={handleUpdateVisit}
                      onDeleteVisit={handleDeleteVisit}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employee-performance">
                <Card>
                  <CardContent className="pt-6">
                    <EmployeePerformance
                      visits={visits}
                      employees={employees}
                      groups={groups}
                      onUpdateVisit={handleUpdateVisit}
                    />
                    <div className="mt-6">
                      <ExcelExport visits={visits} employees={employees} groups={groups} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>

      {showEmployeeForm && (
        <SimpleModal
          isOpen={showEmployeeForm}
          onClose={() => setShowEmployeeForm(false)}
          title={employeeFormMode === "add" ? "직원 추가" : "직원 정보 수정"}
        >
          <EmployeeForm
            mode={employeeFormMode}
            employeeId={selectedEmployeeId}
            employees={employees}
            groups={groups}
            onSubmit={handleEmployeeSubmit}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </SimpleModal>
      )}

      {showPasswordForm && currentUser && (
        <SimpleModal isOpen={showPasswordForm} onClose={() => setShowPasswordForm(false)} title="비밀번호 변경">
          <PasswordChangeForm
            userId={currentUser.id}
            currentPassword={employees.find((emp) => emp.id === currentUser.id)?.password || ""}
            onPasswordChange={handlePasswordChange}
            onCancel={() => setShowPasswordForm(false)}
          />
        </SimpleModal>
      )}

      {showVisitDetails && (
        <SimpleModal
          isOpen={showVisitDetails}
          onClose={() => setShowVisitDetails(false)}
          title={
            selectedVisitType === "all"
              ? "전체 방문 기록"
              : selectedVisitType === "completed"
                ? "계약 완료 방문 기록"
                : "계약 금액 상세"
          }
        >
          <VisitDetails visits={selectedVisitData} onClose={() => setShowVisitDetails(false)} />
        </SimpleModal>
      )}
    </div>
  )
}
