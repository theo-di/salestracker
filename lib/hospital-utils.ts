import type { Hospital } from "@/types/hospital"

// 병원 데이터 저장
export const saveHospitals = (hospitals: Hospital[]) => {
  try {
    localStorage.setItem("hospitals", JSON.stringify(hospitals))
    return true
  } catch (error) {
    console.error("병원 데이터 저장 중 오류 발생:", error)
    return false
  }
}

// 병원 데이터 로드
export const loadHospitals = (): Hospital[] => {
  try {
    const data = localStorage.getItem("hospitals")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("병원 데이터 로드 중 오류 발생:", error)
    return []
  }
}
