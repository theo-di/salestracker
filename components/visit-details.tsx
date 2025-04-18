"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Visit } from "@/types"

interface VisitDetailsProps {
  visits: Visit[]
  onClose: () => void
}

export default function VisitDetails({ visits, onClose }: VisitDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // 검색 필터링
  const filteredVisits = visits.filter(
    (visit) =>
      visit.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.employeeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="병원명, 위치, 담당자로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>병원명</TableHead>
              <TableHead>방문 시간</TableHead>
              <TableHead>위치</TableHead>
              <TableHead>계약 상태</TableHead>
              <TableHead>계약 금액</TableHead>
              <TableHead>담당자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  방문 기록이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{visit.hospitalName}</TableCell>
                  <TableCell>{formatDate(visit.visitStartTime)}</TableCell>
                  <TableCell>{visit.location}</TableCell>
                  <TableCell>
                    {visit.contractStatus === "none" && "계약 없음"}
                    {visit.contractStatus === "pending" && "계약 진행 중"}
                    {visit.contractStatus === "completed" && "계약 완료"}
                  </TableCell>
                  <TableCell>{visit.contractAmount ? visit.contractAmount.toLocaleString() + "원" : "-"}</TableCell>
                  <TableCell>{visit.employeeName}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>닫기</Button>
      </div>
    </div>
  )
}
