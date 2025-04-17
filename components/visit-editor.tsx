"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, User, Calendar, Clock, FileText, CreditCard, Edit, Save, X } from "lucide-react"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"

interface VisitEditorProps {
  data: {
    id: string
    hospitalName: string
    hospitalType: string
    contactName: string
    contactPhone: string
    visitStartTime: string
    visitEndTime: string
    visitNotes: string
    contractStatus: string
    contractAmount: string
    location: string
    employeeName: string
    employeeId: string
  }
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (updatedData: Partial<Visit>) => void
  employees: Employee[]
}

// 날짜 포맷팅 함수 (안전하게 처리)
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "날짜 미지정"
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  } catch (e) {
    return "날짜 형식 오류"
  }
}

// 시간 포맷팅 함수 (안전하게 처리)
const formatTime = (dateStr: string): string => {
  if (!dateStr) return "시간 미지정"
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (e) {
    return "시간 형식 오류"
  }
}

// ISO 문자열을 datetime-local 입력에 맞는 형식으로 변환
const formatDateTimeForInput = (dateStr: string): string => {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    return date.toISOString().slice(0, 16)
  } catch (e) {
    return ""
  }
}

export default function VisitEditor({ data, isEditing, onEdit, onCancel, onSave, employees }: VisitEditorProps) {
  // 편집 가능한 필드들의 상태
  const [hospitalName, setHospitalName] = useState(data.hospitalName)
  const [hospitalType, setHospitalType] = useState(data.hospitalType)
  const [contactName, setContactName] = useState(data.contactName)
  const [contactPhone, setContactPhone] = useState(data.contactPhone)
  const [visitStartTime, setVisitStartTime] = useState(formatDateTimeForInput(data.visitStartTime))
  const [visitEndTime, setVisitEndTime] = useState(formatDateTimeForInput(data.visitEndTime))
  const [visitNotes, setVisitNotes] = useState(data.visitNotes)
  const [contractStatus, setContractStatus] = useState(data.contractStatus)
  const [contractAmount, setContractAmount] = useState(data.contractAmount)
  const [location, setLocation] = useState(data.location)
  const [employeeName, setEmployeeName] = useState(data.employeeName)
  const [showContractAmount, setShowContractAmount] = useState(
    data.contractStatus === "completed" || data.contractStatus === "pending",
  )

  // 데이터가 변경되면 상태 업데이트
  useEffect(() => {
    setHospitalName(data.hospitalName)
    setHospitalType(data.hospitalType)
    setContactName(data.contactName)
    setContactPhone(data.contactPhone)
    setVisitStartTime(formatDateTimeForInput(data.visitStartTime))
    setVisitEndTime(formatDateTimeForInput(data.visitEndTime))
    setVisitNotes(data.visitNotes)
    setContractStatus(data.contractStatus)
    setContractAmount(data.contractAmount)
    setLocation(data.location)
    setEmployeeName(data.employeeName)
    setShowContractAmount(data.contractStatus === "completed" || data.contractStatus === "pending")
  }, [data])

  const handleContractStatusChange = (value: string) => {
    setContractStatus(value)
    setShowContractAmount(value === "completed" || value === "pending")
  }

  const handleSave = () => {
    // 업데이트된 방문 데이터 생성
    const updatedData: Partial<Visit> = {
      id: data.id,
      hospitalName,
      hospitalType,
      contactName,
      contactPhone,
      visitStartTime: new Date(visitStartTime),
      visitEndTime: new Date(visitEndTime),
      visitNotes,
      contractStatus,
      contractAmount: contractAmount ? Number.parseInt(contractAmount) : undefined,
      location,
      employeeId: data.employeeId,
      employeeName: employeeName,
    }

    onSave(updatedData)
  }

  // 읽기 전용 모드
  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            편집
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex justify-between items-center">
              <span>{data.hospitalName || "병원명"}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  data.hospitalType === "new"
                    ? "bg-blue-100 text-blue-800"
                    : data.hospitalType === "existing"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.hospitalType === "new"
                  ? "신규 병원"
                  : data.hospitalType === "existing"
                    ? "기존 병원"
                    : "병원 구분"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{data.location || "위치 정보"}</span>
              </div>

              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {data.contactName || "담당자"} {data.contactPhone ? `(${data.contactPhone})` : ""}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>{data.visitStartTime ? formatDate(data.visitStartTime) : "방문 날짜"}</span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {data.visitStartTime && data.visitEndTime
                    ? `${formatTime(data.visitStartTime)} - ${formatTime(data.visitEndTime)}`
                    : "방문 시간"}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>담당 직원: {data.employeeName || "미지정"}</span>
              </div>

              <div className="pt-2">
                <div className="text-sm font-medium mb-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  계약 상태:
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      data.contractStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : data.contractStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {data.contractStatus === "completed"
                      ? "계약 완료"
                      : data.contractStatus === "pending"
                        ? "계약 진행 중"
                        : data.contractStatus === "none"
                          ? "계약 없음"
                          : "계약 상태"}
                  </span>
                </div>

                {(data.contractStatus === "completed" || data.contractStatus === "pending") && data.contractAmount && (
                  <div className="text-sm ml-6 text-gray-600">
                    계약 금액: {Number.parseInt(data.contractAmount).toLocaleString("ko-KR")}원
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              상담 내용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-md min-h-[100px] text-sm">
              {data.visitNotes || "상담 내용이 없습니다."}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 편집 모드
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>방문 정보 편집</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">병원명 *</Label>
              <Input
                id="hospitalName"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalType">병원 구분 *</Label>
              <Select value={hospitalType} onValueChange={setHospitalType} required>
                <SelectTrigger id="hospitalType">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">신규 병원</SelectItem>
                  <SelectItem value="existing">기존 병원</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="contactName">담당자 이름 *</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">연락처 *</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="visitStartTime">방문 시작 시간 *</Label>
              <Input
                id="visitStartTime"
                type="datetime-local"
                value={visitStartTime}
                onChange={(e) => setVisitStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitEndTime">방문 종료 시간 *</Label>
              <Input
                id="visitEndTime"
                type="datetime-local"
                value={visitEndTime}
                onChange={(e) => setVisitEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="employeeName">담당 직원 *</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="담당 직원 이름 입력"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">위치 *</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="contractStatus">계약 상태 *</Label>
              <Select value={contractStatus} onValueChange={handleContractStatusChange} required>
                <SelectTrigger id="contractStatus">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">계약 없음</SelectItem>
                  <SelectItem value="pending">계약 진행 중</SelectItem>
                  <SelectItem value="completed">계약 완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showContractAmount && (
              <div className="space-y-2">
                <Label htmlFor="contractAmount">계약 금액</Label>
                <Input
                  id="contractAmount"
                  type="number"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <Label htmlFor="visitNotes">상담 내용</Label>
            <Textarea id="visitNotes" rows={4} value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            취소
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
