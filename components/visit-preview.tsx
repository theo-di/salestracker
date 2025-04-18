"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Clock, User, Phone, FileText, DollarSign } from "lucide-react"

interface VisitPreviewProps {
  data: {
    hospitalName: string
    hospitalType: string
    contactName: string
    contactPhone: string
    visitStartTime: string
    visitEndTime: string
    visitNotes?: string
    contractStatus: string
    contractAmount?: string
    location: string
    employeeName: string
  }
}

export default function VisitPreview({ data }: VisitPreviewProps) {
  // 병원 구분 텍스트 변환
  const hospitalTypeText = data.hospitalType === "new" ? "신규 병원" : "기존 병원"

  // 계약 상태 텍스트 변환
  let contractStatusText = "계약 없음"
  let contractStatusColor = "text-gray-500"

  if (data.contractStatus === "pending") {
    contractStatusText = "계약 진행 중"
    contractStatusColor = "text-blue-500"
  } else if (data.contractStatus === "completed") {
    contractStatusText = "계약 완료"
    contractStatusColor = "text-green-500"
  }

  // 방문 시간 포맷팅
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString()
    } catch (error) {
      return dateTimeStr
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-xl font-bold">{data.hospitalName}</h3>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">{hospitalTypeText}</span>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">방문 위치</p>
              <p>{data.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">방문 시작</p>
                <p>{formatDateTime(data.visitStartTime)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">방문 종료</p>
                <p>{formatDateTime(data.visitEndTime)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">담당자</p>
                <p>{data.contactName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">연락처</p>
                <p>{data.contactPhone}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <User className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">담당 직원</p>
              <p>{data.employeeName}</p>
            </div>
          </div>

          {data.visitNotes && (
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">상담 내용</p>
                <p className="whitespace-pre-wrap">{data.visitNotes}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <div className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">계약 상태</p>
              <p className={contractStatusColor}>{contractStatusText}</p>
            </div>
          </div>

          {data.contractAmount && data.contractStatus !== "none" && (
            <div className="flex items-start space-x-2">
              <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">계약 금액</p>
                <p>{Number(data.contractAmount).toLocaleString()}원</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
