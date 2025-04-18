"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Search, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import SimpleModal from "./simple-modal"
import type { Visit, Employee } from "@/types"

interface EmployeeVisitsProps {
  visits: Visit[]
  employees: Employee[]
  onUpdateVisit: (visit: Visit) => void
  onDeleteVisit: (visitId: string) => void
}

export default function EmployeeVisits({ visits, employees, onUpdateVisit, onDeleteVisit }: EmployeeVisitsProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // 방문 기록 필터링
  const filteredVisits = visits
    .filter((visit) => {
      // 직원 필터링
      if (selectedEmployee !== "all" && visit.employeeId !== selectedEmployee) {
        return false
      }

      // 날짜 필터링
      if (selectedDate) {
        const visitDate = new Date(visit.visitStartTime)
        if (
          visitDate.getFullYear() !== selectedDate.getFullYear() ||
          visitDate.getMonth() !== selectedDate.getMonth() ||
          visitDate.getDate() !== selectedDate.getDate()
        ) {
          return false
        }
      }

      // 검색어 필터링
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          visit.hospitalName.toLowerCase().includes(searchLower) ||
          visit.location.toLowerCase().includes(searchLower) ||
          visit.contactName.toLowerCase().includes(searchLower) ||
          visit.employeeName.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
    .sort((a, b) => new Date(b.visitStartTime).getTime() - new Date(a.visitStartTime).getTime())

  // 방문 기록 수정 처리
  const handleEditVisit = (visit: Visit) => {
    setEditingVisit({ ...visit })
    setShowEditModal(true)
  }

  // 방문 기록 삭제 확인
  const handleDeleteConfirm = (visitId: string) => {
    setShowDeleteConfirm(visitId)
  }

  // 방문 기록 삭제 처리
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteVisit(showDeleteConfirm)
      setShowDeleteConfirm(null)
    }
  }

  // 방문 기록 수정 저장
  const handleSaveEdit = () => {
    if (editingVisit) {
      onUpdateVisit(editingVisit)
      setShowEditModal(false)
      setEditingVisit(null)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return format(new Date(date), "yyyy년 MM월 dd일 HH:mm", { locale: ko })
  }

  // 필터 초기화
  const resetFilters = () => {
    setSelectedEmployee("all")
    setSearchTerm("")
    setSelectedDate(undefined)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">직원별 방문 기록</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <Label htmlFor="date-filter">날짜 선택</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date-filter" variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ko }) : "날짜 선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="search">검색</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="search"
                placeholder="병원명, 위치, 담당자 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              초기화
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>방문 기록 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>방문 일시</TableHead>
                  <TableHead>병원명</TableHead>
                  <TableHead>위치</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>계약 상태</TableHead>
                  <TableHead>계약 금액</TableHead>
                  <TableHead>담당 직원</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      방문 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{format(new Date(visit.visitStartTime), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell className="font-medium">{visit.hospitalName}</TableCell>
                      <TableCell>{visit.location}</TableCell>
                      <TableCell>{visit.contactName}</TableCell>
                      <TableCell>
                        {visit.contractStatus === "none" && "계약 없음"}
                        {visit.contractStatus === "pending" && "계약 진행 중"}
                        {visit.contractStatus === "completed" && "계약 완료"}
                      </TableCell>
                      <TableCell>{visit.contractAmount ? visit.contractAmount.toLocaleString() + "원" : "-"}</TableCell>
                      <TableCell>{visit.employeeName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditVisit(visit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteConfirm(visit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* 방문 기록 수정 모달 */}
      {editingVisit && (
        <SimpleModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="방문 기록 수정">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>병원명</Label>
              <Input
                value={editingVisit.hospitalName}
                onChange={(e) => setEditingVisit({ ...editingVisit, hospitalName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>방문 시작 시간</Label>
                <Input
                  type="datetime-local"
                  value={format(new Date(editingVisit.visitStartTime), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      visitStartTime: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>방문 종료 시간</Label>
                <Input
                  type="datetime-local"
                  value={format(new Date(editingVisit.visitEndTime), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      visitEndTime: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>위치</Label>
              <Input
                value={editingVisit.location}
                onChange={(e) => setEditingVisit({ ...editingVisit, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>담당자 이름</Label>
                <Input
                  value={editingVisit.contactName}
                  onChange={(e) => setEditingVisit({ ...editingVisit, contactName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>담당자 연락처</Label>
                <Input
                  value={editingVisit.contactPhone}
                  onChange={(e) => setEditingVisit({ ...editingVisit, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>계약 상태</Label>
              <Select
                value={editingVisit.contractStatus}
                onValueChange={(value) => setEditingVisit({ ...editingVisit, contractStatus: value })}
              >
                <SelectTrigger>
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
                <Label>계약 금액</Label>
                <Input
                  type="number"
                  value={editingVisit.contractAmount || ""}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      contractAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
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

      {/* 삭제 확인 모달 */}
      <SimpleModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="방문 기록 삭제 확인"
      >
        <div className="space-y-4">
          <p>정말 이 방문 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
