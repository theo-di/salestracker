"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Save } from "lucide-react"
import type { Visit } from "@/types/visit"
import { formatDate, formatTime } from "@/lib/date-utils"
import KakaoMap from "@/components/kakao-map"
import { useToast } from "@/hooks/use-toast"

interface VisitDetailProps {
  visitId: string
  visits: Visit[]
  onBack: () => void
  onUpdateVisit: (visit: Visit) => void
}

export default function VisitDetail({ visitId, visits, onBack, onUpdateVisit }: VisitDetailProps) {
  const { toast } = useToast()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 편집 가능한 필드들
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

  useEffect(() => {
    const foundVisit = visits.find((v) => v.id === visitId)
    if (foundVisit) {
      setVisit(foundVisit)

      // 편집 필드 초기화
      setHospitalName(foundVisit.hospitalName)
      setHospitalType(foundVisit.hospitalType)
      setContactName(foundVisit.contactName)
      setContactPhone(foundVisit.contactPhone)
      setVisitStartTime(foundVisit.visitStartTime.toISOString().slice(0, 16))
      setVisitEndTime(foundVisit.visitEndTime.toISOString().slice(0, 16))
      setVisitNotes(foundVisit.visitNotes || "")
      setContractStatus(foundVisit.contractStatus)
      setContractAmount(foundVisit.contractAmount?.toString() || "")
      setShowContractAmount(foundVisit.contractStatus === "completed" || foundVisit.contractStatus === "pending")
    }
  }, [visitId, visits])

  const handleContractStatusChange = (value: string) => {
    setContractStatus(value)
    setShowContractAmount(value === "completed" || value === "pending")
  }

  const handleSave = () => {
    if (!visit) return

    const updatedVisit: Visit = {
      ...visit,
      hospitalName,
      hospitalType,
      contactName,
      contactPhone,
      visitStartTime: new Date(visitStartTime),
      visitEndTime: new Date(visitEndTime),
      visitNotes,
      contractStatus,
      contractAmount: contractAmount ? Number.parseInt(contractAmount) : 0,
    }

    onUpdateVisit(updatedVisit)
    setVisit(updatedVisit)
    setIsEditing(false)

    toast({
      title: "방문 정보 업데이트",
      description: "방문 정보가 성공적으로 업데이트되었습니다.",
    })
  }

  if (!visit) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>방문 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로
        </Button>
        <h2 className="text-2xl font-bold">방문 상세 정보</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="ml-auto">
            <Edit className="h-4 w-4 mr-2" />
            편집
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">병원명</Label>
                  <Input id="hospitalName" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalType">병원 구분</Label>
                  <Select value={hospitalType} onValueChange={setHospitalType}>
                    <SelectTrigger id="hospitalType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">신규 병원</SelectItem>
                      <SelectItem value="existing">기존 병원</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">담당자 이름</Label>
                  <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">연락처</Label>
                  <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">병원명:</div>
                  <div className="col-span-2">{visit.hospitalName}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">병원 구분:</div>
                  <div className="col-span-2">{visit.hospitalType === "new" ? "신규 병원" : "기존 병원"}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">담당자:</div>
                  <div className="col-span-2">{visit.contactName}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">연락처:</div>
                  <div className="col-span-2">{visit.contactPhone}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">위치:</div>
                  <div className="col-span-2">{visit.location}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>방문 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitStartTime">방문 시작 시간</Label>
                  <Input
                    id="visitStartTime"
                    type="datetime-local"
                    value={visitStartTime}
                    onChange={(e) => setVisitStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitEndTime">방문 종료 시간</Label>
                  <Input
                    id="visitEndTime"
                    type="datetime-local"
                    value={visitEndTime}
                    onChange={(e) => setVisitEndTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractStatus">계약 상태</Label>
                  <Select value={contractStatus} onValueChange={handleContractStatusChange}>
                    <SelectTrigger id="contractStatus">
                      <SelectValue />
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
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">방문 날짜:</div>
                  <div className="col-span-2">{formatDate(visit.visitStartTime)}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">방문 시간:</div>
                  <div className="col-span-2">
                    {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">계약 상태:</div>
                  <div className="col-span-2">
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
                  </div>
                </div>

                {(visit.contractStatus === "completed" || visit.contractStatus === "pending") && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">계약 금액:</div>
                    <div className="col-span-2">{visit.contractAmount?.toLocaleString("ko-KR")} 원</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>상담 내용</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              rows={5}
              placeholder="상담 내용을 입력하세요"
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-md min-h-[100px]">{visit.visitNotes || "상담 내용이 없습니다."}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>방문 위치</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] rounded-md overflow-hidden">
            <KakaoMap visits={[visit]} center={{ lat: visit.latitude, lng: visit.longitude }} zoom={15} />
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      )}
    </div>
  )
}
