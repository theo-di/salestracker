"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface PasswordChangeFormProps {
  userId: string
  currentPassword: string
  onPasswordChange: (userId: string, newPassword: string) => void
  onCancel: () => void
}

export default function PasswordChangeForm({
  userId,
  currentPassword,
  onPasswordChange,
  onCancel,
}: PasswordChangeFormProps) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 현재 비밀번호 확인
    if (oldPassword !== currentPassword) {
      setError("현재 비밀번호가 일치하지 않습니다.")
      return
    }

    // 새 비밀번호 확인
    if (newPassword.length < 4) {
      setError("새 비밀번호는 최소 4자 이상이어야 합니다.")
      return
    }

    // 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
      return
    }

    // 비밀번호 변경 처리
    onPasswordChange(userId, newPassword)
    setSuccess(true)

    // 폼 초기화
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">비밀번호가 성공적으로 변경되었습니다.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="oldPassword">현재 비밀번호</Label>
          <Input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">비밀번호 변경</Button>
        </div>
      </div>
    </form>
  )
}
