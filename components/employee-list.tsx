"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Employee } from "../types"

interface EmployeeListProps {
  employees: Employee[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>담당 지역</TableHead>
            <TableHead>직급</TableHead>
            <TableHead>소속 그룹</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                등록된 직원이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.phone || "-"}</TableCell>
                <TableCell>{employee.email || "-"}</TableCell>
                <TableCell>{employee.region || "-"}</TableCell>
                <TableCell>{employee.position || "-"}</TableCell>
                <TableCell>{employee.groupName || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(employee.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                      onClick={() => onDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
