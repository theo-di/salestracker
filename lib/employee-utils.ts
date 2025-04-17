import type { Employee } from "@/types/employee"

// 직원 데이터 저장
export const saveEmployees = (employees: Employee[]) => {
  try {
    localStorage.setItem("employees", JSON.stringify(employees))
    return true
  } catch (error) {
    console.error("직원 데이터 저장 중 오류 발생:", error)
    return false
  }
}

// 직원 데이터 로드
export const loadEmployees = (): Employee[] => {
  try {
    const data = localStorage.getItem("employees")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("직원 데이터 로드 중 오류 발생:", error)
    return []
  }
}
