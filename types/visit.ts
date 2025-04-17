export interface Visit {
  id: string
  hospitalName: string
  hospitalType: string
  contactName: string
  contactPhone: string
  visitStartTime: Date
  visitEndTime: Date
  visitNotes?: string
  contractStatus: string
  contractAmount?: number
  location: string
  latitude: number
  longitude: number
  createdAt: Date
  employeeId: string // 담당 직원 ID 추가
  employeeName: string // 담당 직원 이름 추가
}
