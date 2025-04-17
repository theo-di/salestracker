import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"
import type { Hospital } from "@/types/hospital"

// 랜덤 날짜 생성 (최근 30일 이내)
const randomDate = (daysAgo = 30) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// 랜덤 시간 설정
const setRandomTime = (date: Date, startHour = 9, endHour = 18) => {
  const hour = startHour + Math.floor(Math.random() * (endHour - startHour))
  const minute = Math.floor(Math.random() * 60)
  date.setHours(hour, minute, 0, 0)
  return new Date(date)
}

// 방문 종료 시간 계산 (시작 시간 + 랜덤 시간)
const calculateEndTime = (startTime: Date) => {
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + 30 + Math.floor(Math.random() * 90))
  return endTime
}

// 병원 이름 목록
const hospitalNames = [
  "서울 중앙병원",
  "미래 치과",
  "행복 한의원",
  "연세 정형외과",
  "강남 피부과",
  "우리 내과",
  "서울 안과",
  "미소 치과",
  "건강 한의원",
  "365 의원",
  "푸른 소아과",
  "현대 병원",
  "삼성 메디컬",
  "하나 의원",
  "새봄 피부과",
  "연세 치과",
]

// 담당자 이름 목록
const contactNames = ["김원장", "박상무", "이과장", "정원장", "최실장", "한부장", "조과장", "윤원장"]

// 지역 목록
const locations = [
  "서울시 강남구",
  "서울시 서초구",
  "서울시 송파구",
  "서울시 마포구",
  "서울시 영등포구",
  "서울시 종로구",
  "서울시 강서구",
  "서울시 용산구",
]

// 직원 이름 목록
const employeeNames = [
  "홍길동",
  "김영희",
  "이철수",
  "박지영",
  "최민준",
  "정수민",
  "강동원",
  "윤서연",
  "조현우",
  "한미영",
  "배준호",
  "신지원",
]

// 직급 목록
const positions = ["사원", "대리", "과장", "차장", "부장", "이사"]

// 랜덤 방문 데이터 생성
export const generateMockVisits = (count: number): Visit[] => {
  const visits: Visit[] = []

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate()
    const visitStartTime = setRandomTime(new Date(createdAt))
    const visitEndTime = calculateEndTime(visitStartTime)

    const hospitalName = hospitalNames[Math.floor(Math.random() * hospitalNames.length)]
    const hospitalType = Math.random() > 0.4 ? "existing" : "new"
    const contactName = contactNames[Math.floor(Math.random() * contactNames.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]

    // 계약 상태 (30% 완료, 20% 진행 중, 50% 없음)
    let contractStatus = "none"
    const contractRandom = Math.random()
    if (contractRandom < 0.3) {
      contractStatus = "completed"
    } else if (contractRandom < 0.5) {
      contractStatus = "pending"
    }

    // 계약 금액 (계약이 있는 경우만)
    let contractAmount
    if (contractStatus !== "none") {
      contractAmount = Math.floor(Math.random() * 50 + 10) * 100000 // 100만원 ~ 600만원
    }

    visits.push({
      id: `visit-${i + 1}`,
      hospitalName,
      hospitalType,
      contactName,
      contactPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      visitStartTime,
      visitEndTime,
      visitNotes: Math.random() > 0.3 ? `${hospitalName} 방문 상담 진행` : undefined,
      contractStatus,
      contractAmount,
      location,
      latitude: 37.5 + Math.random() * 0.1,
      longitude: 127.0 + Math.random() * 0.1,
      createdAt,
    })
  }

  // 날짜 내림차순 정렬 (최신순)
  return visits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// 랜덤 직원 데이터 생성
export const generateMockEmployees = (count: number): Employee[] => {
  const employees: Employee[] = []

  for (let i = 0; i < count; i++) {
    const name = employeeNames[Math.floor(Math.random() * employeeNames.length)]
    const position = positions[Math.floor(Math.random() * positions.length)]
    const region = locations[Math.floor(Math.random() * locations.length)]

    employees.push({
      id: `EMP${(i + 1).toString().padStart(3, "0")}`,
      name,
      phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${name.replace(/\s+/g, "")}@company.com`,
      region,
      position,
    })
  }

  return employees
}

// 랜덤 병원 데이터 생성
export const generateMockHospitals = (count: number): Hospital[] => {
  const hospitals: Hospital[] = []
  const usedNames = new Set()

  // 병원 이름이 중복되지 않도록 생성
  while (hospitals.length < count) {
    const name = hospitalNames[Math.floor(Math.random() * hospitalNames.length)]
    if (usedNames.has(name)) continue
    usedNames.add(name)

    const location = locations[Math.floor(Math.random() * locations.length)]
    const contactName = contactNames[Math.floor(Math.random() * contactNames.length)]

    // 계약 상태 (30% 완료, 20% 진행 중, 50% 없음)
    let contractStatus = "none"
    const contractRandom = Math.random()
    if (contractRandom < 0.3) {
      contractStatus = "completed"
    } else if (contractRandom < 0.5) {
      contractStatus = "pending"
    }

    hospitals.push({
      id: `HOSP${(hospitals.length + 1).toString().padStart(3, "0")}`,
      name,
      location,
      contactName,
      contactPhone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      contractStatus,
      latitude: 37.5 + Math.random() * 0.1,
      longitude: 127.0 + Math.random() * 0.1,
    })
  }

  return hospitals
}
