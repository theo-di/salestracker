"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileDown } from "lucide-react"
import type { Visit, Employee, Group } from "@/types"

interface ExcelExportProps {
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
}

export default function ExcelExport({ visits, employees, groups }: ExcelExportProps) {
  const [exportType, setExportType] = useState<string>("visits")

  // CSV 데이터 생성 함수
  const generateCSV = () => {
    let csvContent = ""
    let fileName = ""

    if (exportType === "visits") {
      // 방문 기록 내보내기
      fileName = "방문기록_" + new Date().toISOString().split("T")[0] + ".csv"

      // 헤더 추가
      csvContent =
        "방문ID,병원명,병원구분,담당자,연락처,방문시작시간,방문종료시간,상담내용,계약상태,계약금액,위치,위도,경도,생성일시,직원ID,직원명\n"

      // 데이터 추가
      visits.forEach((visit) => {
        const row = [
          visit.id,
          `"${visit.hospitalName}"`,
          visit.hospitalType === "new" ? "신규병원" : "기존병원",
          `"${visit.contactName}"`,
          visit.contactPhone,
          new Date(visit.visitStartTime).toLocaleString(),
          new Date(visit.visitEndTime).toLocaleString(),
          `"${visit.visitNotes || ""}"`,
          visit.contractStatus === "none" ? "계약없음" : visit.contractStatus === "pending" ? "계약진행중" : "계약완료",
          visit.contractAmount || "",
          `"${visit.location}"`,
          visit.latitude,
          visit.longitude,
          new Date(visit.createdAt).toLocaleString(),
          visit.employeeId,
          `"${visit.employeeName}"`,
        ]

        csvContent += row.join(",") + "\n"
      })
    } else if (exportType === "employees") {
      // 직원 정보 내보내기
      fileName = "직원정보_" + new Date().toISOString().split("T")[0] + ".csv"

      // 헤더 추가
      csvContent = "직원ID,이름,연락처,이메일,담당지역,직급,소속지점ID,소속지점명\n"

      // 데이터 추가
      employees.forEach((employee) => {
        const row = [
          employee.id,
          `"${employee.name}"`,
          employee.phone || "",
          employee.email || "",
          `"${employee.region || ""}"`,
          employee.position || "",
          employee.groupId || "",
          `"${employee.groupName || ""}"`,
        ]

        csvContent += row.join(",") + "\n"
      })
    } else if (exportType === "performance") {
      // 실적 분석 내보내기
      fileName = "실적분석_" + new Date().toISOString().split("T")[0] + ".csv"

      // 헤더 추가
      csvContent = "직원ID,직원명,소속지점,총방문수,계약완료수,전환율,총계약금액\n"

      // 직원별 실적 계산
      employees.forEach((employee) => {
        const employeeVisits = visits.filter((visit) => visit.employeeId === employee.id)
        const totalVisits = employeeVisits.length
        const completedContracts = employeeVisits.filter((visit) => visit.contractStatus === "completed").length
        const totalAmount = employeeVisits
          .filter((visit) => visit.contractStatus === "completed" && visit.contractAmount)
          .reduce((sum, visit) => sum + (visit.contractAmount || 0), 0)
        const conversionRate = totalVisits > 0 ? ((completedContracts / totalVisits) * 100).toFixed(1) : "0.0"

        const row = [
          employee.id,
          `"${employee.name}"`,
          `"${employee.groupName || "미지정"}"`,
          totalVisits,
          completedContracts,
          conversionRate,
          totalAmount,
        ]

        csvContent += row.join(",") + "\n"
      })
    }

    return { csvContent, fileName }
  }

  // 엑셀 다운로드 처리
  const handleExport = () => {
    const { csvContent, fileName } = generateCSV()

    // BOM(Byte Order Mark) 추가하여 한글 깨짐 방지
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" })

    // 다운로드 링크 생성 및 클릭
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">데이터 내보내기</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="export-type">내보내기 유형</Label>
          <Select value={exportType} onValueChange={setExportType}>
            <SelectTrigger id="export-type">
              <SelectValue placeholder="내보내기 유형 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visits">방문 기록</SelectItem>
              <SelectItem value="employees">직원 정보</SelectItem>
              <SelectItem value="performance">실적 분석</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExport}>
          <FileDown className="h-4 w-4 mr-2" />
          엑셀로 내보내기
        </Button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        * 내보내기 파일은 CSV 형식으로 저장되며, Microsoft Excel이나 Google 스프레드시트에서 열 수 있습니다.
      </p>
    </div>
  )
}
