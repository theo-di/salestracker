"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MapPin, Loader2, RefreshCw, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import VisitPreview from "@/components/visit-preview"
import SimpleModal from "@/components/simple-modal"
import type { Visit } from "@/types/visit"
import type { Employee } from "@/types/employee"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface NewVisitProps {
  onAddVisit: (visit: Visit) => void
  employees: Employee[]
  currentUser: {
    id: string
    username: string
    isAdmin: boolean
  }
}

export default function NewVisit({ onAddVisit, employees, currentUser }: NewVisitProps) {
  const { toast } = useToast()
  const [hospitalName, setHospitalName] = useState("")
  const [hospitalType, setHospitalType] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [visitStartTime, setVisitStartTime] = useState("")
  const [visitEndTime, setVisitEndTime] = useState("")
  const [visitNotes, setVisitNotes] = useState("")
  const [contractStatus, setContractStatus] = useState("")
  const [contractAmount, setContractAmount] = useState("")
  const [showContractAmount, setShowContractAmount] = useState(false)
  const [location, setLocation] = useState("서울시 중구")
  const [latitude, setLatitude] = useState(37.5665)
  const [longitude, setLongitude] = useState(126.978)
  const [showPreview, setShowPreview] = useState(false)
  const [formValid, setFormValid] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [autoUpdateLocation, setAutoUpdateLocation] = useState(true)
  const [locationUpdateSuccess, setLocationUpdateSuccess] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // 위치 정보 업데이트 간격 (밀리초)
  const locationUpdateInterval = 60000 // 1분
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const locationWatchIdRef = useRef<number | null>(null)

  // 미리보기 환경 감지
  useEffect(() => {
    // 미리보기 환경 감지 로직
    const checkIfPreviewMode = () => {
      if (typeof window !== "undefined") {
        // vercel.app 도메인이나 localhost를 미리보기 환경으로 간주
        const isPreview =
          window.location.hostname.includes("vercel.app") ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        setIsPreviewMode(isPreview)

        if (isPreview) {
          console.log("미리보기 환경이 감지되었습니다. 위치 정보 API가 제한됩니다.")
        }
      }
    }

    checkIfPreviewMode()
  }, [])

  // 현재 위치 가져오기 (미리보기 모드가 확인된 후에 실행)
  useEffect(() => {
    // 기본 위치 설정 (서울시 중심)
    setLatitude(37.5665)
    setLongitude(126.978)
    setLocation("서울시 중구")

    // 미리보기 모드가 아니고 자동 업데이트가 활성화된 경우에만 위치 추적 시작
    if (!isPreviewMode && autoUpdateLocation) {
      startLocationTracking()
    } else if (isPreviewMode) {
      // 미리보기 모드에서는 모의 위치 데이터 사용
      simulateLocationUpdate()
    }

    // 컴포넌트 언마운트 시 위치 추적 중지
    return () => {
      stopLocationTracking()
    }
  }, [isPreviewMode, autoUpdateLocation])

  // 모의 위치 업데이트 (미리보기 모드용)
  const simulateLocationUpdate = () => {
    setIsLoadingLocation(true)

    // 약간의 지연 후 모의 위치 데이터 설정
    setTimeout(() => {
      // 서울 내 랜덤한 위치 생성 (약간의 변동성 추가)
      const randomLat = 37.5665 + (Math.random() - 0.5) * 0.01
      const randomLng = 126.978 + (Math.random() - 0.5) * 0.01

      setLatitude(randomLat)
      setLongitude(randomLng)
      setLocation(`서울시 중구 (미리보기 모드)`)
      setIsLoadingLocation(false)
      setLocationUpdateSuccess(true)
      setLocationError(null)

      // 3초 후 성공 표시 제거
      setTimeout(() => {
        setLocationUpdateSuccess(false)
      }, 3000)
    }, 1000)
  }

  // 위치 추적 시작 (실제 환경용)
  const startLocationTracking = () => {
    // 미리보기 모드에서는 실행하지 않음
    if (isPreviewMode) {
      simulateLocationUpdate()
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    // 위치 정보 API 사용 가능 여부 확인
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        // 위치 정보 한 번 가져오기
        navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })

        // 지속적인 위치 추적 설정
        if (autoUpdateLocation) {
          try {
            // watchPosition으로 위치 변경 추적
            locationWatchIdRef.current = navigator.geolocation.watchPosition(
              handlePositionSuccess,
              handlePositionError,
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
            )
          } catch (watchError) {
            console.warn("위치 추적 설정 실패:", watchError)
          }

          // 주기적인 위치 업데이트 (백업 방법)
          locationIntervalRef.current = setInterval(() => {
            if (autoUpdateLocation && !isPreviewMode) {
              try {
                navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0,
                })
              } catch (intervalError) {
                console.warn("주기적 위치 업데이트 실패:", intervalError)
              }
            }
          }, locationUpdateInterval)
        }
      } catch (error) {
        console.error("위치 정보 요청 중 오류 발생:", error)
        handlePositionError({ code: 0, message: "위치 정보 요청 중 오류가 발생했습니다." })
      }

      // 10초 후에도 위치 정보를 가져오지 못하면 타임아웃 처리
      setTimeout(() => {
        setIsLoadingLocation((prevLoading) => {
          if (prevLoading) {
            setLocationError("위치 정보를 가져오는데 시간이 너무 오래 걸립니다. 기본 위치가 설정되었습니다.")
            return false
          }
          return prevLoading
        })
      }, 10000)
    } else {
      handlePositionError({ code: 0, message: "이 브라우저에서는 위치 정보를 지원하지 않습니다." })
    }
  }

  // 위치 추적 중지
  const stopLocationTracking = () => {
    // watchPosition 중지
    if (locationWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(locationWatchIdRef.current)
      } catch (error) {
        console.warn("위치 추적 중지 중 오류 발생:", error)
      }
      locationWatchIdRef.current = null
    }

    // 주기적 업데이트 중지
    if (locationIntervalRef.current !== null) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }
  }

  // 위치 정보 성공 처리
  const handlePositionSuccess = (position: GeolocationPosition) => {
    setLatitude(position.coords.latitude)
    setLongitude(position.coords.longitude)
    setLocation(`위도: ${position.coords.latitude.toFixed(6)}, 경도: ${position.coords.longitude.toFixed(6)}`)
    setIsLoadingLocation(false)
    setLocationError(null)
    setLocationUpdateSuccess(true)

    // 3초 후 성공 표시 제거
    setTimeout(() => {
      setLocationUpdateSuccess(false)
    }, 3000)

    // 카카오맵 API가 있으면 주소로 변환 시도
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      reverseGeocode(position.coords.latitude, position.coords.longitude)
    }
  }

  // 위치 정보 오류 처리
  const handlePositionError = (error: { code?: number; message: string }) => {
    console.error("위치 정보를 가져오는데 실패했습니다:", error)

    let errorMessage = "위치 정보를 가져올 수 없습니다. 기본 위치가 설정되었습니다."

    // 오류 코드에 따른 메시지 설정
    if (error.code === 1) {
      errorMessage = "위치 정보 접근 권한이 거부되었습니다. 기본 위치가 설정되었습니다."
    } else if (error.code === 2) {
      errorMessage = "위치 정보를 사용할 수 없습니다. 기본 위치가 설정되었습니다."
    } else if (error.code === 3) {
      errorMessage = "위치 정보 요청 시간이 초과되었습니다. 기본 위치가 설정되었습니다."
    }

    setLocationError(errorMessage)
    setIsLoadingLocation(false)
  }

  // 위도/경도를 주소로 변환하는 함수
  const reverseGeocode = (lat: number, lng: number) => {
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      try {
        const geocoder = new window.kakao.maps.services.Geocoder()

        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].address
            let fullAddress = ""

            if (address.region_1depth_name) {
              fullAddress += address.region_1depth_name + " "
            }
            if (address.region_2depth_name) {
              fullAddress += address.region_2depth_name + " "
            }
            if (address.region_3depth_name) {
              fullAddress += address.region_3depth_name
            }
            if (address.main_address_no) {
              fullAddress += " " + address.main_address_no
            }

            setLocation(fullAddress || `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`)
          }
        })
      } catch (error) {
        console.warn("주소 변환 중 오류 발생:", error)
      }
    }
  }

  // 위치 정보 새로고침
  const refreshLocation = () => {
    setIsLoadingLocation(true)
    setLocationError(null)
    setLocationUpdateSuccess(false)

    // 미리보기 모드에서는 모의 위치 데이터 사용
    if (isPreviewMode) {
      simulateLocationUpdate()

      toast({
        title: "위치 정보 알림",
        description: "미리보기 환경에서는 실제 위치 정보를 사용할 수 없어 모의 위치가 설정되었습니다.",
      })
      return
    }

    // 실제 환경에서 위치 정보 가져오기
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            handlePositionSuccess(position)

            toast({
              title: "위치 정보 업데이트",
              description: "현재 위치 정보가 업데이트되었습니다.",
            })
          },
          (error) => {
            handlePositionError(error)

            toast({
              title: "위치 정보 오류",
              description: "위치 정보를 가져오는데 실패했습니다. 기본 위치가 설정되었습니다.",
              variant: "destructive",
            })
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
      } catch (error) {
        console.error("위치 정보 요청 중 오류 발생:", error)
        handlePositionError({ message: "위치 정보 요청 중 오류가 발생했습니다." })

        toast({
          title: "위치 정보 오류",
          description: "위치 정보 요청 중 오류가 발생했습니다. 기본 위치가 설정되었습니다.",
          variant: "destructive",
        })
      }
    } else {
      handlePositionError({ message: "이 브라우저에서는 위치 정보를 지원하지 않습니다." })

      toast({
        title: "위치 정보 오류",
        description: "이 브라우저에서는 위치 정보를 지원하지 않습니다. 기본 위치가 설정되었습니다.",
        variant: "destructive",
      })
    }
  }

  // 자동 위치 업데이트 토글
  const toggleAutoUpdate = () => {
    const newValue = !autoUpdateLocation
    setAutoUpdateLocation(newValue)

    if (newValue) {
      toast({
        title: "자동 위치 업데이트 활성화",
        description: isPreviewMode
          ? "미리보기 모드에서는 모의 위치 데이터가 사용됩니다."
          : "위치 정보가 자동으로 업데이트됩니다.",
      })

      if (isPreviewMode) {
        simulateLocationUpdate()
      } else {
        startLocationTracking()
      }
    } else {
      toast({
        title: "자동 위치 업데이트 비활성화",
        description: "위치 정보를 수동으로 업데이트해야 합니다.",
      })
      stopLocationTracking()
    }
  }

  // 폼 유효성 검사
  useEffect(() => {
    const isValid =
      hospitalName.trim() !== "" &&
      hospitalType !== "" &&
      contactName.trim() !== "" &&
      contactPhone.trim() !== "" &&
      visitStartTime !== "" &&
      visitEndTime !== "" &&
      contractStatus !== ""

    setFormValid(isValid)
  }, [hospitalName, hospitalType, contactName, contactPhone, visitStartTime, visitEndTime, contractStatus])

  const handleContractStatusChange = (value: string) => {
    setContractStatus(value)
    setShowContractAmount(value === "completed" || value === "pending")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 새 방문 객체 생성
    const visitStartTimeDate = new Date(visitStartTime)
    const visitEndTimeDate = new Date(visitEndTime)

    console.log("방문 시작 시간:", visitStartTime, "->", visitStartTimeDate)
    console.log("방문 종료 시간:", visitEndTime, "->", visitEndTimeDate)

    const newVisit: Visit = {
      id: Date.now().toString(),
      hospitalName,
      hospitalType,
      contactName,
      contactPhone,
      visitStartTime: visitStartTimeDate,
      visitEndTime: visitEndTimeDate,
      visitNotes,
      contractStatus,
      contractAmount: contractAmount ? Number.parseInt(contractAmount) : undefined,
      location,
      latitude,
      longitude,
      createdAt: new Date(),
      employeeId: currentUser.id, // 현재 로그인한 사용자의 ID 사용
      employeeName: currentUser.username, // 현재 로그인한 사용자의 이름 사용
    }

    console.log("새 방문 데이터 생성:", newVisit)

    // 부모 컴포넌트에 전달
    onAddVisit(newVisit)

    // 폼 초기화
    setHospitalName("")
    setHospitalType("")
    setContactName("")
    setContactPhone("")
    setVisitStartTime("")
    setVisitEndTime("")
    setVisitNotes("")
    setContractStatus("")
    setContractAmount("")
    setShowContractAmount(false)

    // 성공 메시지 표시
    toast({
      title: "방문 등록 완료",
      description: "방문 기록이 성공적으로 저장되었습니다.",
    })
  }

  // 미리보기 데이터
  const previewData = {
    hospitalName,
    hospitalType,
    contactName,
    contactPhone,
    visitStartTime,
    visitEndTime,
    visitNotes,
    contractStatus,
    contractAmount,
    location,
    employeeName: currentUser.username, // 현재 로그인한 사용자의 이름 사용
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">신규 방문 등록</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">병원명 *</Label>
                <Input
                  id="hospitalName"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalType">병원 구분 *</Label>
                <Select value={hospitalType} onValueChange={setHospitalType} required>
                  <SelectTrigger id="hospitalType">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">신규 병원</SelectItem>
                    <SelectItem value="existing">기존 병원</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">담당자 이름 *</Label>
                <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">연락처 *</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="visitStartTime">방문 시작 시간 *</Label>
                <Input
                  id="visitStartTime"
                  type="datetime-local"
                  value={visitStartTime}
                  onChange={(e) => setVisitStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitEndTime">방문 종료 시간 *</Label>
                <Input
                  id="visitEndTime"
                  type="datetime-local"
                  value={visitEndTime}
                  onChange={(e) => setVisitEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="contractStatus">계약 상태 *</Label>
                <Select value={contractStatus} onValueChange={handleContractStatusChange} required>
                  <SelectTrigger id="contractStatus">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">계약 없음</SelectItem>
                    <SelectItem value="pending">계약 진행 중</SelectItem>
                    <SelectItem value="completed">계약 완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showContractAmount && (
                <div className="space-y-2">
                  <Label htmlFor="contractAmount">계약 금액</Label>
                  <Input
                    id="contractAmount"
                    type="number"
                    value={contractAmount}
                    onChange={(e) => setContractAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <Label htmlFor="visitNotes">상담 내용</Label>
              <Textarea id="visitNotes" rows={4} value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Label>위치 정보</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-update" checked={autoUpdateLocation} onCheckedChange={toggleAutoUpdate} />
                    <Label htmlFor="auto-update" className="text-sm cursor-pointer">
                      자동 업데이트
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={refreshLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        위치 가져오는 중...
                      </>
                    ) : locationUpdateSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        위치 업데이트 완료
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        위치 새로고침
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isPreviewMode && (
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                  <AlertDescription className="text-amber-700">
                    미리보기 환경에서는 실제 위치 정보를 사용할 수 없어 모의 위치 데이터가 사용됩니다.
                  </AlertDescription>
                </Alert>
              )}

              {locationError && !isPreviewMode && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}

              <div className="h-[200px] bg-gray-100 rounded-md flex items-center justify-center mb-4 relative">
                {isLoadingLocation ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-500" />
                    <p className="text-gray-500">현재 위치를 가져오는 중입니다...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-gray-500 mb-1">{location}</p>
                    <p className="text-xs text-gray-400">
                      위도: {latitude.toFixed(6)}, 경도: {longitude.toFixed(6)}
                    </p>
                    {isPreviewMode && (
                      <p className="text-xs text-amber-500 mt-2">미리보기 모드: 모의 위치 데이터 사용 중</p>
                    )}
                    {autoUpdateLocation && !isPreviewMode && (
                      <p className="text-xs text-emerald-500 mt-2">자동 위치 업데이트가 활성화되어 있습니다</p>
                    )}
                  </div>
                )}

                {locationUpdateSuccess && !isLoadingLocation && (
                  <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    위치 업데이트됨
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">위치 직접 입력 *</Label>
                <Input
                  id="location"
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  위치 정보를 자동으로 가져올 수 없는 경우 직접 입력해주세요.
                  {autoUpdateLocation &&
                    !isPreviewMode &&
                    " 자동 업데이트가 활성화된 경우 위치가 자동으로 갱신될 수 있습니다."}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" disabled={!formValid} onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>

              <Button type="submit" disabled={!formValid || isLoadingLocation}>
                방문 기록 저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SimpleModal isOpen={showPreview} onClose={() => setShowPreview(false)} title="방문 정보 미리보기">
        <VisitPreview data={previewData} />
      </SimpleModal>
    </div>
  )
}
