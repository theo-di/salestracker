"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/dashboard"
import NewVisit from "@/components/new-visit"
import VisitHistory from "@/components/visit-history"
import Performance from "@/components/performance"
import AdminPanel from "@/components/admin-panel"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"
import type { Group } from "@/types/group"

interface MainAppProps {
  user: {
    id: string
    username: string
    isAdmin: boolean
    password: string
  }
  checkinTime: string
  onLogout: () => void
  visits: Visit[]
  employees: Employee[]
  groups: Group[]
  onAddVisit: (visit: Visit) => void
  onUpdateVisit: (updatedVisit: Visit) => void
  onPasswordChange: (userId: string, newPassword: string) => void
  onAddEmployee: (employee: Employee) => void
  onUpdateEmployee: (employee: Employee) => void
  onDeleteEmployee: (employeeId: string) => void
  onAddGroup: (group: Group) => void
  onUpdateGroup: (group: Group) => void
  onDeleteGroup: (groupId: string) => void
}

export default function MainApp({
  user,
  checkinTime,
  onLogout,
  visits,
  employees,
  groups,
  onAddVisit,
  onUpdateVisit,
  onPasswordChange,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: MainAppProps) {
  const [activePage, setActivePage] = useState("dashboard")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 현재 시간 업데이트를 위한 타이머
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar
        username={user.username}
        userId={user.id}
        userPassword={user.password}
        isAdmin={user.isAdmin}
        currentTime={currentTime}
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        onPasswordChange={onPasswordChange}
      />

      <div className="flex-1 p-6 md:ml-64">
        {activePage === "dashboard" && <Dashboard checkinTime={checkinTime} visits={visits} />}

        {activePage === "new-visit" && <NewVisit onAddVisit={onAddVisit} employees={employees} currentUser={user} />}

        {activePage === "visit-history" && (
          <VisitHistory visits={visits} employees={employees} onUpdateVisit={onUpdateVisit} />
        )}

        {activePage === "performance" && (
          <>
            {console.log("성과 분석에 전달되는 방문 데이터:", visits.length, "건")}
            <Performance visits={visits} />
          </>
        )}

        {activePage === "admin-panel" && user.isAdmin && (
          <AdminPanel
            visits={visits}
            employees={employees}
            groups={groups}
            onAddEmployee={onAddEmployee}
            onUpdateEmployee={onUpdateEmployee}
            onDeleteEmployee={onDeleteEmployee}
            onAddGroup={onAddGroup}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
          />
        )}
      </div>
    </div>
  )
}
