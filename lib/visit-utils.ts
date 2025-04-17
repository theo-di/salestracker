import type { Visit } from "@/types/visit"

// 오늘 방문 수 계산
export const countTodayVisits = (visits: Visit[]): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    const visitDate = new Date(visit.visitStartTime)
    visitDate.setHours(0, 0, 0, 0)
    return visitDate.getTime() === today.getTime()
  }).length
}

// 이번 주 방문 수 계산
export const countWeeklyVisits = (visits: Visit[]): number => {
  const today = new Date()
  const firstDayOfWeek = new Date(today)
  const day = today.getDay() || 7 // 일요일이면 7로 처리
  firstDayOfWeek.setDate(today.getDate() - day + 1) // 이번 주 월요일
  firstDayOfWeek.setHours(0, 0, 0, 0)

  return visits.filter((visit) => {
    return visit.visitStartTime >= firstDayOfWeek
  }).length
}

// 이번 달 방문 수 계산
export const countMonthlyVisits = (visits: Visit[]): number => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return visits.filter((visit) => {
    return visit.visitStartTime >= firstDayOfMonth
  }).length
}

// 이번 달 계약 수 계산
export const countMonthlyContracts = (visits: Visit[]): number => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return visits.filter((visit) => {
    return visit.visitStartTime >= firstDayOfMonth && visit.contractStatus === "completed"
  }).length
}

// 전환율 계산 (계약 수 / 방문 수)
export const calculateConversionRate = (visits: number, contracts: number): number => {
  if (visits === 0) return 0
  return (contracts / visits) * 100
}
