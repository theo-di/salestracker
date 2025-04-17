"use client"

import { useEffect, useRef } from "react"
import type { Visit } from "@/types/visit"

interface KakaoMapProps {
  visits: Visit[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onMarkerClick?: (visit: Visit) => void
}

declare global {
  interface Window {
    kakao: any
  }
}

export default function KakaoMap({
  visits,
  center = { lat: 37.5665, lng: 126.978 }, // 서울 중심
  zoom = 10,
  height = "100%",
  onMarkerClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Kakao Maps SDK가 로드되었는지 확인
    if (typeof window.kakao === "undefined") {
      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAPS_API_KEY&libraries=services,clusterer,drawing&autoload=false`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.kakao.maps.load(() => initMap())
      }
    } else {
      window.kakao.maps.load(() => initMap())
    }

    function initMap() {
      if (!mapRef.current) return

      // 지도 생성
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: zoom,
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map

      // 마커 클러스터러 생성
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 5,
      })

      // 방문 데이터로 마커 생성
      const markers = visits.map((visit) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(visit.latitude, visit.longitude),
          title: visit.hospitalName,
        })

        // 마커 클릭 이벤트
        if (onMarkerClick) {
          window.kakao.maps.event.addListener(marker, "click", () => {
            onMarkerClick(visit)
          })
        }

        // 인포윈도우 생성
        const infoContent = `
          <div style="padding:5px;width:200px;">
            <strong>${visit.hospitalName}</strong>
            <p>${visit.location}</p>
            <p>방문일: ${visit.visitStartTime.toLocaleDateString()}</p>
          </div>
        `

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: infoContent,
        })

        // 마커 마우스오버 이벤트
        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          infoWindow.open(map, marker)
        })

        // 마커 마우스아웃 이벤트
        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          infoWindow.close()
        })

        return marker
      })

      // 클러스터러에 마커 추가
      clusterer.addMarkers(markers)
    }

    return () => {
      // 컴포넌트 언마운트 시 정리 작업
      mapInstanceRef.current = null
    }
  }, [visits, center, zoom, onMarkerClick])

  return (
    <div ref={mapRef} style={{ width: "100%", height: height }} className="rounded-md">
      {/* 지도가 로드되기 전 표시할 내용 */}
      {!window.kakao && (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
    </div>
  )
}
