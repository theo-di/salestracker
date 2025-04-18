"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, Edit, Trash2 } from "lucide-react"
import SimpleModal from "./simple-modal"
import type { Visit } from "@/types"

interface VisitScheduleProps {
  visits: Visit[]
  onUpdateVisit: (visit: Visit) => void
  onDeleteVisit: (visitId: string) => void
}

export default function VisitSchedule({ visits, onUpdateVisit, onDeleteVisit }: VisitScheduleProps) {
  const [selectedView, setSelectedView] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // 날짜 필터링
  const filteredVisits = visits
    .filter((visit) => {
      const visitDate = new Date(visit.visitStartTime)

      if (selectedView === "daily") {
        // 일별 보기: 선택한 날짜와 동일한 날짜
        return (
          visitDate.getFullYear() === selectedDate.getFullYear() &&
          visitDate.getMonth() === selectedDate.getMonth() &&
          visitDate.getDate() === selectedDate.getDate()
        )
      } else if (selectedView === "weekly") {
        // 주별 보기: 선택한 날짜가 속한 주의 일요일부터 토요일까지
        const startOfWeek = new Date(selectedDate)
        const day = selectedDate.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
        startOfWeek.setDate(selectedDate.getDate() - day) // 해당 주의 일요일
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // 해당 주의 토요일
        endOfWeek.setHours(23, 59, 59, 999)

        return visitDate >= startOfWeek && visitDate <= endOfWeek
      } else if (selectedView === "monthly") {
        // 월별 보기: 선택한 날짜와 동일한 월
        return (
          visitDate.getFullYear() === selectedDate.getFullYear() && visitDate.getMonth() === selectedDate.getMonth()
        )
      }

      return true
    })
    .sort((a, b) => new Date(a.visitStartTime).getTime() - new Date(b.visitStartTime).getTime())

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

  // 요일 구하기
  const getDayOfWeek = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return days[new Date(date).getDay()]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>방문 일정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <Tabs
            value={selectedView}
            onValueChange={(value: string) => setSelectedView(value as "daily" | "weekly" | "monthly")}
          >
            <TabsList>
              <TabsTrigger value="daily">일별</TabsTrigger>
              <TabsTrigger value="weekly">주별</TabsTrigger>
              <TabsTrigger value="monthly">월별</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>요일</TableHead>
                <TableHead>시간</TableHead>
                <TableHead>병원명</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>계약 상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    해당 기간에 방문 일정이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit) => {
                  const visitDate = new Date(visit.visitStartTime)
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>{format(visitDate, "yyyy-MM-dd")}</TableCell>
                      <TableCell>{getDayOfWeek(visitDate)}</TableCell>
                      <TableCell>
                        {format(new Date(visit.visitStartTime), "HH:mm")} ~
                        {format(new Date(visit.visitEndTime), "HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{visit.hospitalName}</TableCell>
                      <TableCell>{visit.location}</TableCell>
                      <TableCell>
                        {visit.contractStatus === "none" && "계약 없음"}
                        {visit.contractStatus === "pending" && "계약 진행 중"}
                        {visit.contractStatus === "completed" && "계약 완료"}
                      </TableCell>
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
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* 방문 기록 수정 모달 */}
      {editingVisit && (
        <SimpleModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="방문 일정 수정">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">병원명</label>
              <Input
                value={editingVisit.hospitalName}
                onChange={(e) => setEditingVisit({ ...editingVisit, hospitalName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">방문 시작 시간</label>
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
                <label className="text-sm font-medium">방문 종료 시간</label>
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
              <label className="text-sm font-medium">위치</label>
              <Input
                value={editingVisit.location}
                onChange={(e) => setEditingVisit({ ...editingVisit, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">계약 상태</label>
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
                <label className="text-sm font-medium">계약 금액</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">상담 내용</label>
              <Textarea
                value={editingVisit.visitNotes || ""}
                onChange={(e) => setEditingVisit({ ...editingVisit, visitNotes: e.target.value })}
                rows={4}
              />
            </div>

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
    </Card>
  )
}
