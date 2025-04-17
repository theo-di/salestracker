// 엑셀 파일로 내보내기 함수
export const exportToExcel = (data: any[], fileName: string) => {
  try {
    // 데이터를 CSV 형식으로 변환
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((item) =>
      Object.values(item)
        .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    // CSV 파일 생성 및 다운로드
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error("데이터 내보내기 중 오류 발생:", error)
    return false
  }
}
