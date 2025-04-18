"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import type { Visit } from "@/types"

interface LocationMapWidgetProps {
  visits: Visit[]
  settings?: Record<string, any>
}

export default function LocationMapWidget({ visits, settings }: LocationMapWidgetProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    // 미리보기 환경 감지
    if (typeof window !== "undefined") {
      const isPreview =
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      setIsPreviewMode(isPreview)
    }

    // 카카오맵 API 로드
    if (typeof window !== "undefined" && !window.kakao && !isPreviewMode) {
      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`
      script.async = true
      script.onload = () => {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true)
        })
      }
      document.head.appendChild(script)
    } else if (typeof window !== "undefined" && window.kakao) {
      setIsMapLoaded(true)
    }
  }, [isPreviewMode])

  useEffect(() => {
    if (isMapLoaded && !isPreviewMode && visits.length > 0 && typeof window.kakao !== "undefined") {
      // 지도 생성
      const container = document.getElementById("map")
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 8,
      }
      const map = new window.kakao.maps.Map(container, options)

      // 최근 방문 위치 마커 추가
      const recentVisits = [...visits]
        .sort((a, b) => new Date(b.visitStartTime).getTime() - new Date(a.visitStartTime).getTime())
        .slice(0, 10) // 최근 10개만 표시

      const bounds = new window.kakao.maps.LatLngBounds()

      recentVisits.forEach((visit) => {
        const position = new window.kakao.maps.LatLng(visit.latitude, visit.longitude)

        const marker = new window.kakao.maps.Marker({
          position,
          map,
        })

        // 인포윈도우 생성
        const infoContent = `
          <div style="padding:5px;font-size:12px;width:150px;">
            <strong>${visit.hospitalName}</strong><br>
            ${new Date(visit.visitStartTime).toLocaleDateString()}<br>
            ${
              visit.contractStatus === "completed"
                ? "계약 완료"
                : visit.contractStatus === "pending"
                  ? "계약 진행 중"
                  : "계약 없음"
            }
          </div>
        `

        const infowindow = new window.kakao.maps.InfoWindow({
          content: infoContent,
        })

        // 마커 클릭 시 인포윈도우 표시
        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker)
        })

        bounds.extend(position)
      })

      // 모든 마커가 보이도록 지도 범위 조정
      if (recentVisits.length > 0) {
        map.setBounds(bounds)
      }
    }
  }, [isMapLoaded, visits, isPreviewMode])

  if (isPreviewMode) {
    return (
      <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">미리보기 환경에서는 지도를 표시할 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div id="map" className="h-[200px] rounded-md">
      {!isMapLoaded && (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
            <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
