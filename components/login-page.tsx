"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, Eye, EyeOff } from "lucide-react"

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())
  const [showPassword, setShowPassword] = useState(false)

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = onLogin(username, password)
    if (!success) {
      setError(true)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-center mb-6">세일즈트래커</h2>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 mr-2 text-emerald-600" />
              <span className="text-lg font-medium">{currentTime}</span>
            </div>
            <p className="text-sm text-gray-500">로그인하여 출근 체크를 완료하세요</p>
          </div>

          <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>데모 계정 정보:</strong>
              <br />
              일반 사용자: ID: user / PW: password
              <br />
              관리자: ID: admin / PW: admin123
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
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
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>로그인 정보가 올바르지 않습니다. 다시 시도하세요.</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                로그인 및 출근체크
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
