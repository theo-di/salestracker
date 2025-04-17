"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import VisitPreview from "@/components/visit-preview"
import SimpleModal from "@/components/simple-modal"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"

interface NewVisitProps {
  onAddVisit: (visit: Visit) => void
  employees: Employee[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
}

export default function NewVisit({ onAddVisit, employees, currentUser }: NewVisitProps) {
  const { toast } = useToast()
  const [hospitalName, setHospitalName] = useState("")
  const [hospitalType, setHospitalType] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [visitStartTime, setVisitStartTime] = useState("")
  const [visitEndTime, setVisitEndTime] = useState("")
  const [visitNotes, setVisitNotes] = useState("")
  const [contractStatus, setContractStatus] = useState("")
  const [contractAmount, setContractAmount] = useState("")
  const [showContractAmount, setShowContractAmount] = useState(false)
  const [location, setLocation] = useState("서울시 강남구")
  const [showPreview, setShowPreview] = useState(false)
  const [formValid, setFormValid] = useState(false)

  // 폼 유효성 검사
  useEffect(() => {
    const isValid =
      hospitalName.trim() !== "" &&
      hospitalType !== "" &&
      contactName.trim() !== "" &&
      contactPhone.trim() !== "" &&
      visitStartTime !== "" &&
      visitEndTime !== "" &&
      contractStatus !== ""

    setFormValid(isValid)
  }, [hospitalName, hospitalType, contactName, contactPhone, visitStartTime, visitEndTime, contractStatus])

  const handleContractStatusChange = (value: string) => {
    setContractStatus(value)
    setShowContractAmount(value === "completed" || value === "pending")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 새 방문 객체 생성
    const visitStartTimeDate = new Date(visitStartTime)
    const visitEndTimeDate = new Date(visitEndTime)

    console.log("방문 시작 시간:", visitStartTime, "->", visitStartTimeDate)
    console.log("방문 종료 시간:", visitEndTime, "->", visitEndTimeDate)

    const newVisit: Visit = {
      id: Date.now().toString(),
      hospitalName,
      hospitalType,
      contactName,
      contactPhone,
      visitStartTime: visitStartTimeDate,
      visitEndTime: visitEndTimeDate,
      visitNotes,
      contractStatus,
      contractAmount: contractAmount ? Number.parseInt(contractAmount) : undefined,
      location,
      latitude: 37.5665,
      longitude: 126.978,
      createdAt: new Date(),
      employeeId: currentUser.id, // 현재 로그인한 사용자의 ID 사용
      employeeName: currentUser.username, // 현재 로그인한 사용자의 이름 사용
    }

    console.log("새 방문 데이터 생성:", newVisit)

    // 부모 컴포넌트에 전달
    onAddVisit(newVisit)

    // 폼 초기화
    setHospitalName("")
    setHospitalType("")
    setContactName("")
    setContactPhone("")
    setVisitStartTime("")
    setVisitEndTime("")
    setVisitNotes("")
    setContractStatus("")
    setContractAmount("")
    setShowContractAmount(false)

    // 성공 메시지 표시
    toast({
      title: "방문 등록 완료",
      description: "방문 기록이 성공적으로 저장되었습니다.",
    })
  }

  // 미리보기 데이터
  const previewData = {
    hospitalName,
    hospitalType,
    contactName,
    contactPhone,
    visitStartTime,
    visitEndTime,
    visitNotes,
    contractStatus,
    contractAmount,
    location,
    employeeName: currentUser.username, // 현재 로그인한 사용자의 이름 사용
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">신규 방문 등록</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
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

            <div className="mb-6">
              <Label>위치 정보</Label>
              <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center mb-2">
                <p className="text-gray-500">지도 데이터가 준비 중입니다.</p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500 flex-grow" id="locationText">
                  위치: {location} (자동으로 감지됨)
                </p>
                <Input
                  className="max-w-xs"
                  placeholder="위치 직접 입력"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" disabled={!formValid} onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>

              <Button type="submit" disabled={!formValid}>
                방문 기록 저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SimpleModal isOpen={showPreview} onClose={() => setShowPreview(false)} title="방문 정보 미리보기">
        <VisitPreview data={previewData} />
      </SimpleModal>
    </div>
  )
}
