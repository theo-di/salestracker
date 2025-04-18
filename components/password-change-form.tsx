"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"

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
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          <div className="relative">
            <Input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowOldPassword(!showOldPassword)}
              aria-label={showOldPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
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
