export interface Employee {
  id: string
  name: string
  phone?: string
  email?: string
  region?: string
  position?: string
  password?: string
  groupId?: string
  groupName?: string
}

export interface Group {
  id: string
  name: string
}

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
  employeeId: string
  employeeName: string
}
