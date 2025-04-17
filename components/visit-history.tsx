"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import VisitEditor from "@/components/visit-editor"
import SimpleModal from "@/components/simple-modal"
import { useToast } from "@/hooks/use-toast"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"

// 날짜 포맷팅 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// 시간 포맷팅 함수
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

interface VisitHistoryProps {
  visits: Visit[]
  employees: Employee[]
  onUpdateVisit: (updatedVisit: Visit) => void
}

export default function VisitHistory({ visits, employees, onUpdateVisit }: VisitHistoryProps) {
  const { toast } = useToast()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [filter, setFilter] = useState("all")
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // 초기 데이터 설정
    setFilteredVisits(visits)
  }, [visits])

  const applyFilter = () => {
    let result = [...visits]

    // 날짜 필터링
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      result = result.filter((visit) => visit.visitStartTime >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // 해당 날짜의 끝으로 설정
      result = result.filter((visit) => visit.visitStartTime <= toDate)
    }

    // 유형 필터링
    if (filter === "new") {
      result = result.filter((visit) => visit.hospitalType === "new")
    } else if (filter === "existing") {
      result = result.filter((visit) => visit.hospitalType === "existing")
    } else if (filter === "contract") {
      result = result.filter((visit) => visit.contractStatus === "completed")
    }

    // 날짜 내림차순 정렬
    result.sort((a, b) => b.visitStartTime.getTime() - a.visitStartTime.getTime())

    setFilteredVisits(result)
  }

  const handleViewVisit = (visit: Visit) => {
    setSelectedVisit(visit)
    setIsEditing(false)
    setShowPreview(true)
  }

  const handleEditStart = () => {
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
  }

  const handleSaveVisit = (updatedData: Partial<Visit>) => {
    if (!selectedVisit) return

    // 기존 방문 데이터와 업데이트된 데이터 병합
    const updatedVisit: Visit = {
      ...selectedVisit,
      ...updatedData,
    }

    // 부모 컴포넌트에 업데이트 전달
    onUpdateVisit(updatedVisit)

    // 필터링된 방문 목록 업데이트
    setFilteredVisits((prev) => prev.map((visit) => (visit.id === updatedVisit.id ? updatedVisit : visit)))

    // 선택된 방문 정보 업데이트
    setSelectedVisit(updatedVisit)

    // 편집 모드 종료
    setIsEditing(false)

    // 성공 메시지 표시
    toast({
      title: "방문 정보 업데이트",
      description: "방문 정보가 성공적으로 업데이트되었습니다.",
    })
  }

  // 미리보기 데이터 변환
  const getPreviewData = (visit: Visit | null) => {
    if (!visit)
      return {
        id: "",
        hospitalName: "",
        hospitalType: "",
        contactName: "",
        contactPhone: "",
        visitStartTime: "",
        visitEndTime: "",
        visitNotes: "",
        contractStatus: "",
        contractAmount: "",
        location: "",
        employeeName: "",
        employeeId: "",
      }

    return {
      id: visit.id,
      hospitalName: visit.hospitalName,
      hospitalType: visit.hospitalType,
      contactName: visit.contactName,
      contactPhone: visit.contactPhone,
      visitStartTime: visit.visitStartTime.toISOString(),
      visitEndTime: visit.visitEndTime.toISOString(),
      visitNotes: visit.visitNotes || "",
      contractStatus: visit.contractStatus,
      contractAmount: visit.contractAmount?.toString() || "",
      location: visit.location,
      employeeName: visit.employeeName,
      employeeId: visit.employeeId,
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">방문 기록</h2>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">시작일</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">종료일</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter">필터</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="모든 방문" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 방문</SelectItem>
                  <SelectItem value="new">신규 병원만</SelectItem>
                  <SelectItem value="existing">기존 병원만</SelectItem>
                  <SelectItem value="contract">계약 완료만</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={applyFilter} className="w-full">
            필터 적용
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>병원명</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>방문시간</TableHead>
                  <TableHead>계약상태</TableHead>
                  <TableHead>상세</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length > 0 ? (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{formatDate(visit.visitStartTime)}</TableCell>
                      <TableCell>{visit.hospitalName}</TableCell>
                      <TableCell>{visit.contactName}</TableCell>
                      <TableCell>{visit.hospitalType === "new" ? "신규" : "기존"}</TableCell>
                      <TableCell>
                        {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
                      </TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => handleViewVisit(visit)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      방문 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SimpleModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false)
          setIsEditing(false)
        }}
        title={isEditing ? "방문 정보 편집" : "방문 정보 상세보기"}
      >
        {selectedVisit && (
          <VisitEditor
            data={getPreviewData(selectedVisit)}
            isEditing={isEditing}
            onEdit={handleEditStart}
            onCancel={handleEditCancel}
            onSave={handleSaveVisit}
            employees={employees}
          />
        )}
      </SimpleModal>
    </div>
  )
}
