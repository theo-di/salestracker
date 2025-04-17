"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, PlusCircle, History, LineChart, Users, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PasswordChangeForm from "@/components/password-change-form"

interface SidebarProps {
  username: string
  userId: string
  userPassword: string
  isAdmin: boolean
  currentTime: Date
  activePage: string
  onChangePage: (page: string) => void
  onLogout: () => void
  onPasswordChange: (userId: string, newPassword: string) => void
}

export default function Sidebar({
  username,
  userId,
  userPassword,
  isAdmin,
  currentTime,
  activePage,
  onChangePage,
  onLogout,
  onPasswordChange,
}: SidebarProps) {
  const [formattedTime, setFormattedTime] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    // 현재 시간 포맷팅
    setFormattedTime(currentTime.toLocaleString("ko-KR"))
  }, [currentTime])

  const handlePasswordChange = (userId: string, newPassword: string) => {
    onPasswordChange(userId, newPassword)
  }

  return (
    <div className="bg-slate-800 text-white w-full md:w-64 md:fixed md:h-screen p-4 flex flex-col">
      <h4 className="text-xl font-bold text-center mb-4">세일즈트래커</h4>

      <div className="text-center mb-6">
        <div className="mb-2">안녕하세요, {username}님!</div>
        <div className="text-sm text-gray-300">{formattedTime}</div>
      </div>

      <hr className="border-gray-600 mb-4" />

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onChangePage("dashboard")}
              className={cn(
                "flex items-center w-full px-4 py-2 rounded-md transition-colors",
                activePage === "dashboard" ? "bg-emerald-600 text-white" : "hover:bg-slate-700",
              )}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              대시보드
            </button>
          </li>

          <li>
            <button
              onClick={() => onChangePage("new-visit")}
              className={cn(
                "flex items-center w-full px-4 py-2 rounded-md transition-colors",
                activePage === "new-visit" ? "bg-emerald-600 text-white" : "hover:bg-slate-700",
              )}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              신규 방문 등록
            </button>
          </li>

          <li>
            <button
              onClick={() => onChangePage("visit-history")}
              className={cn(
                "flex items-center w-full px-4 py-2 rounded-md transition-colors",
                activePage === "visit-history" ? "bg-emerald-600 text-white" : "hover:bg-slate-700",
              )}
            >
              <History className="mr-2 h-5 w-5" />
              방문 기록
            </button>
          </li>

          <li>
            <button
              onClick={() => onChangePage("performance")}
              className={cn(
                "flex items-center w-full px-4 py-2 rounded-md transition-colors",
                activePage === "performance" ? "bg-emerald-600 text-white" : "hover:bg-slate-700",
              )}
            >
              <LineChart className="mr-2 h-5 w-5" />
              성과 분석
            </button>
          </li>

          {isAdmin && (
            <li>
              <button
                onClick={() => onChangePage("admin-panel")}
                className={cn(
                  "flex items-center w-full px-4 py-2 rounded-md transition-colors",
                  activePage === "admin-panel" ? "bg-emerald-600 text-white" : "hover:bg-slate-700",
                )}
              >
                <Users className="mr-2 h-5 w-5" />
                관리자 페이지
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-4 space-y-2">
        <Button
          variant="ghost"
          className="flex items-center w-full px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
          onClick={() => setShowPasswordForm(true)}
        >
          <Settings className="mr-2 h-5 w-5" />
          비밀번호 변경
        </Button>

        <Button
          variant="ghost"
          className="flex items-center w-full px-4 py-2 rounded-md hover:bg-slate-700 transition-colors"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          로그아웃
        </Button>
      </div>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          <PasswordChangeForm
            userId={userId}
            currentPassword={userPassword}
            onPasswordChange={handlePasswordChange}
            onCancel={() => setShowPasswordForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
