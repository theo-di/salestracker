"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import type { Employee } from "@/types/employee"
import type { Group } from "@/types/group"

interface EmployeeFormProps {
  mode: "add" | "edit"
  employeeId: string | null
  employees: Employee[]
  groups: Group[]
  onSubmit: (employee: Employee) => void
  onCancel: () => void
}

export default function EmployeeForm({
  mode,
  employeeId,
  employees = [],
  groups = [], // 기본값 빈 배열 추가
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [region, setRegion] = useState("")
  const [position, setPosition] = useState("")
  const [password, setPassword] = useState("")
  const [groupId, setGroupId] = useState("")
  const [groupName, setGroupName] = useState("")
  const [useExistingGroup, setUseExistingGroup] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (mode === "edit" && employeeId) {
      const employee = employees.find((e) => e.id === employeeId)
      if (employee) {
        setId(employee.id)
        setName(employee.name)
        setPhone(employee.phone)
        setEmail(employee.email || "")
        setRegion(employee.region)
        setPosition(employee.position)
        setPassword(employee.password || "")
        setGroupId(employee.groupId || "")
        setGroupName(employee.groupName || "")
        setUseExistingGroup(!!employee.groupId)
      }
    } else {
      // 새 직원 추가 시 ID 생성 (HME + 4자리 숫자)
      // HME로 시작하는 ID만 필터링
      const hmeEmployees = employees.filter((e) => e.id.startsWith("HME"))

      // 번호 추출 및 정렬
      const numbers = hmeEmployees
        .map((e) => {
          const numStr = e.id.substring(3)
          return Number.parseInt(numStr, 10)
        })
        .filter((n) => !isNaN(n))

      // 다음 번호 계산
      let nextNumber = 1
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1
      }

      // 새 ID 생성
      const newId = `HME${nextNumber.toString().padStart(4, "0")}`

      setId(newId)
      setName("")
      setPhone("")
      setEmail("")
      setRegion("")
      setPosition("")
      setPassword("password") // 기본 비밀번호 설정
      setGroupId("")
      setGroupName("")
      setUseExistingGroup(true)
    }
  }, [mode, employeeId, employees])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let finalGroupId = ""
    let finalGroupName = ""

    if (useExistingGroup && groupId) {
      const selectedGroup = groups.find((g) => g.id === groupId)
      finalGroupId = groupId
      finalGroupName = selectedGroup?.name || ""
    } else {
      // 새 그룹 이름을 입력한 경우
      finalGroupId = "" // 새 그룹은 아직 ID가 없음
      finalGroupName = groupName
    }

    const employee: Employee = {
      id,
      name,
      phone,
      email,
      region,
      position,
      password,
      groupId: finalGroupId,
      groupName: finalGroupName,
    }

    onSubmit(employee)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="id">직원 ID</Label>
          <Input id="id" value={id} readOnly disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">연락처 *</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">담당 지역 *</Label>
          <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">직급 *</Label>
          <Select value={position} onValueChange={setPosition} required>
            <SelectTrigger id="position">
              <SelectValue placeholder="직급 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="사원">사원</SelectItem>
              <SelectItem value="대리">대리</SelectItem>
              <SelectItem value="과장">과장</SelectItem>
              <SelectItem value="차장">차장</SelectItem>
              <SelectItem value="부장">부장</SelectItem>
              <SelectItem value="이사">이사</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>소속 그룹</Label>
          <div className="flex space-x-2 mb-2">
            <Button
              type="button"
              variant={useExistingGroup ? "default" : "outline"}
              size="sm"
              onClick={() => setUseExistingGroup(true)}
              className="flex-1"
            >
              기존 그룹
            </Button>
            <Button
              type="button"
              variant={!useExistingGroup ? "default" : "outline"}
              size="sm"
              onClick={() => setUseExistingGroup(false)}
              className="flex-1"
            >
              새 그룹
            </Button>
          </div>

          {useExistingGroup ? (
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="group">
                <SelectValue placeholder="그룹 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                {groups &&
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="groupName"
              placeholder="새 그룹 이름 입력"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}
        </div>

        {mode === "add" && (
          <div className="space-y-2">
            <Label htmlFor="password">초기 비밀번호 *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">직원은 로그인 후 비밀번호를 변경할 수 있습니다.</p>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">{mode === "add" ? "추가" : "수정"}</Button>
        </div>
      </div>
    </form>
  )
}
