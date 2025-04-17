// 날짜 포맷팅 (YYYY-MM-DD)
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// 시간 포맷팅 (HH:MM)
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

// 날짜 및 시간 포맷팅 (YYYY-MM-DD HH:MM)
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`
}
