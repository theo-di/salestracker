import type { Visit } from "@/types/visit"

// 방문 데이터 저장
export const saveVisits = (visits: Visit[]) => {
  try {
    localStorage.setItem("visits", JSON.stringify(visits))
    return true
  } catch (error) {
    console.error("방문 데이터 저장 중 오류 발생:", error)
    return false
  }
}

// 방문 데이터 로드
export const loadVisits = (): Visit[] => {
  try {
    const data = localStorage.getItem("visits")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("방문 데이터 로드 중 오류 발생:", error)
    return []
  }
}
