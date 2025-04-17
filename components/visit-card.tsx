import { Card, CardContent } from "@/components/ui/card"
import { MapPin, User, Calendar, Clock } from "lucide-react"

// 간단한 방문 타입 정의
type Visit = {
  id: string
  hospitalName: string
  hospitalType: string
  contactName: string
  contactPhone: string
  visitStartTime: Date
  visitEndTime: Date
  visitNotes?: string
  contractStatus: string
  contractAmount?: number
  location: string
  createdAt: Date
}

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

interface VisitCardProps {
  visit: Visit
}

export default function VisitCard({ visit }: VisitCardProps) {
  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">{visit.hospitalName}</h4>
            <span
              className={`text-sm px-2 py-1 rounded-full ${
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

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{visit.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>
              {visit.contactName} ({visit.contactPhone})
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(visit.visitStartTime)}</span>
            <Clock className="h-4 w-4 ml-2 mr-1" />
            <span>
              {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
