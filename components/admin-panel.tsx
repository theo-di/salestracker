"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Edit, Trash, Download, Plus, UserPlus, FolderPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EmployeePerformance from "@/components/employee-performance"
import EmployeeForm from "@/components/employee-form"
import GroupForm from "@/components/group-form"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"
import type { Group } from "@/types/group"

interface AdminPanelProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  onAddEmployee: (employee: Employee) => void
  onUpdateEmployee: (employee: Employee) => void
  onDeleteEmployee: (employeeId: string) => void
  onAddGroup: (group: Group) => void
  onUpdateGroup: (group: Group) => void
  onDeleteGroup: (groupId: string) => void
}

export default function AdminPanel({
  visits,
  employees,
  groups,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: AdminPanelProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")

  // 직원 관리 상태
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [employeeFormMode, setEmployeeFormMode] = useState<"add" | "edit">("add")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  // 그룹 관리 상태
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupFormMode, setGroupFormMode] = useState<"add" | "edit">("add")
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  // 직원 추가 핸들러
  const handleAddEmployee = () => {
    setEmployeeFormMode("add")
    setSelectedEmployeeId(null)
    setShowEmployeeForm(true)
  }

  // 직원 수정 핸들러
  const handleEditEmployee = (employeeId: string) => {
    setEmployeeFormMode("edit")
    setSelectedEmployeeId(employeeId)
    setShowEmployeeForm(true)
  }

  // 직원 삭제 핸들러
  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm("정말로 이 직원을 삭제하시겠습니까?")) {
      onDeleteEmployee(employeeId)
      toast({
        title: "직원 삭제",
        description: "직원이 성공적으로 삭제되었습니다.",
      })
    }
  }

  // 직원 폼 제출 핸들러
  const handleEmployeeFormSubmit = (employee: Employee) => {
    // 새 그룹 이름이 있고 그룹 ID가 없는 경우 새 그룹 생성
    if (employee.groupName && !employee.groupId) {
      // 동일한 이름의 그룹이 이미 있는지 확인
      const existingGroup = groups.find((g) => g.name === employee.groupName)

      if (existingGroup) {
        // 기존 그룹이 있으면 그 ID 사용
        employee.groupId = existingGroup.id
      } else {
        // 새 그룹 생성
        const newGroup: Group = {
          id: `GRP${Date.now().toString().slice(-6)}`,
          name: employee.groupName,
          description: `${employee.groupName} 그룹`,
          createdAt: new Date(),
        }

        onAddGroup(newGroup)
        employee.groupId = newGroup.id

        toast({
          title: "새 그룹 생성",
          description: `"${newGroup.name}" 그룹이 생성되었습니다.`,
        })
      }
    }

    if (employeeFormMode === "add") {
      onAddEmployee(employee)
      toast({
        title: "직원 추가",
        description: "새 직원이 성공적으로 추가되었습니다.",
      })
    } else {
      onUpdateEmployee(employee)
      toast({
        title: "직원 정보 업데이트",
        description: "직원 정보가 성공적으로 업데이트되었습니다.",
      })
    }
    setShowEmployeeForm(false)
  }

  // 그룹 추가 핸들러
  const handleAddGroup = () => {
    setGroupFormMode("add")
    setSelectedGroupId(null)
    setShowGroupForm(true)
  }

  // 그룹 수정 핸들러
  const handleEditGroup = (groupId: string) => {
    setGroupFormMode("edit")
    setSelectedGroupId(groupId)
    setShowGroupForm(true)
  }

  // 그룹 삭제 핸들러
  const handleDeleteGroup = (groupId: string) => {
    // 그룹에 속한 직원이 있는지 확인
    const employeesInGroup = employees.filter((emp) => emp.groupId === groupId)

    if (employeesInGroup.length > 0) {
      toast({
        title: "그룹 삭제 실패",
        description: "이 그룹에 속한 직원이 있어 삭제할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (window.confirm("정말로 이 그룹을 삭제하시겠습니까?")) {
      onDeleteGroup(groupId)
      toast({
        title: "그룹 삭제",
        description: "그룹이 성공적으로 삭제되었습니다.",
      })
    }
  }

  // 그룹 폼 제출 핸들러
  const handleGroupFormSubmit = (group: Group) => {
    if (groupFormMode === "add") {
      onAddGroup(group)
      toast({
        title: "그룹 추가",
        description: "새 그룹이 성공적으로 추가되었습니다.",
      })
    } else {
      onUpdateGroup(group)
      toast({
        title: "그룹 정보 업데이트",
        description: "그룹 정보가 성공적으로 업데이트되었습니다.",
      })
    }
    setShowGroupForm(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">관리자 페이지</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">성과 대시보드</TabsTrigger>
          <TabsTrigger value="employees">직원 관리</TabsTrigger>
          <TabsTrigger value="groups">그룹 관리</TabsTrigger>
          <TabsTrigger value="hospitals">병원 관리</TabsTrigger>
          <TabsTrigger value="reports">보고서</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <EmployeePerformance visits={visits} employees={employees} />
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">직원 목록</h3>
                <Button size="sm" onClick={handleAddEmployee}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  직원 추가
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>담당 지역</TableHead>
                      <TableHead>직급</TableHead>
                      <TableHead>소속 그룹</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.id}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.phone}</TableCell>
                          <TableCell>{employee.region}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.groupName || "-"}</TableCell>
                          <TableCell>{employee.email || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          등록된 직원이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">그룹 목록</h3>
                <Button size="sm" onClick={handleAddGroup}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  그룹 추가
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>그룹명</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead>소속 직원 수</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.length > 0 ? (
                      groups.map((group) => {
                        const memberCount = employees.filter((emp) => emp.groupId === group.id).length

                        return (
                          <TableRow key={group.id}>
                            <TableCell>{group.id}</TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell>{group.description || "-"}</TableCell>
                            <TableCell>{group.createdAt.toLocaleDateString()}</TableCell>
                            <TableCell>{memberCount}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          등록된 그룹이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hospitals">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">병원 목록</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    병원 추가
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>병원명</TableHead>
                      <TableHead>지역</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>방문 횟수</TableHead>
                      <TableHead>최근 방문일</TableHead>
                      <TableHead>계약 상태</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.length > 0 ? (
                      // 방문 데이터에서 고유한 병원 목록 추출
                      [...new Map(visits.map((visit) => [visit.hospitalName, visit])).values()].map((visit) => {
                        // 해당 병원의 모든 방문 기록
                        const hospitalVisits = visits.filter((v) => v.hospitalName === visit.hospitalName)
                        // 방문 횟수
                        const visitCount = hospitalVisits.length
                        // 최근 방문일
                        const lastVisitDate = new Date(
                          Math.max(...hospitalVisits.map((v) => v.visitStartTime.getTime())),
                        ).toLocaleDateString()

                        return (
                          <TableRow key={visit.id}>
                            <TableCell>{visit.hospitalName}</TableCell>
                            <TableCell>{visit.location}</TableCell>
                            <TableCell>{visit.contactName}</TableCell>
                            <TableCell>{visit.contactPhone}</TableCell>
                            <TableCell>{visitCount}</TableCell>
                            <TableCell>{lastVisitDate}</TableCell>
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
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          등록된 병원이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-gray-500">보고서 기능은 준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 직원 추가/수정 다이얼로그 */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{employeeFormMode === "add" ? "직원 추가" : "직원 정보 수정"}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            mode={employeeFormMode}
            employeeId={selectedEmployeeId}
            employees={employees}
            groups={groups}
            onSubmit={handleEmployeeFormSubmit}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 그룹 추가/수정 다이얼로그 */}
      <Dialog open={showGroupForm} onOpenChange={setShowGroupForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{groupFormMode === "add" ? "그룹 추가" : "그룹 정보 수정"}</DialogTitle>
          </DialogHeader>
          <GroupForm
            mode={groupFormMode}
            groupId={selectedGroupId}
            groups={groups}
            onSubmit={handleGroupFormSubmit}
            onCancel={() => setShowGroupForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
