import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Calendar, Clock, FileText, CreditCard } from "lucide-react"

interface VisitPreviewProps {
  data: {
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
  }
}

// 날짜 포맷팅 함수 (안전하게 처리)
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "날짜 미지정"
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? "날짜 형식 오류" : date.toLocaleDateString()
  } catch (e) {
    return "날짜 형식 오류"
  }
}

// 시간 포맷팅 함수 (안전하게 처리)
const formatTime = (dateStr: string): string => {
  if (!dateStr) return "시간 미지정"
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime())
      ? "시간 형식 오류"
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (e) {
    return "시간 형식 오류"
  }
}

export default function VisitPreview({ data }: VisitPreviewProps) {
  return (
    <div className="space-y-6">
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
              {data.hospitalType === "new" ? "신규 병원" : data.hospitalType === "existing" ? "기존 병원" : "병원 구분"}
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
                  계약 금액:{" "}
                  {Number.parseInt(data.contractAmount)
                    ? Number.parseInt(data.contractAmount).toLocaleString("ko-KR")
                    : 0}
                  원
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
