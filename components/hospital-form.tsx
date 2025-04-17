"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hospital } from "@/types/hospital"

interface HospitalFormProps {
  mode: "add" | "edit"
  hospitalId: string | null
  hospitals: Hospital[]
  onSubmit: (hospital: Hospital) => void
}

export default function HospitalForm({ mode, hospitalId, hospitals, onSubmit }: HospitalFormProps) {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contractStatus, setContractStatus] = useState("none")
  const [latitude, setLatitude] = useState(37.5665)
  const [longitude, setLongitude] = useState(126.978)

  useEffect(() => {
    if (mode === "edit" && hospitalId) {
      const hospital = hospitals.find((h) => h.id === hospitalId)
      if (hospital) {
        setId(hospital.id)
        setName(hospital.name)
        setLocation(hospital.location)
        setContactName(hospital.contactName)
        setContactPhone(hospital.contactPhone)
        setContractStatus(hospital.contractStatus)
        setLatitude(hospital.latitude)
        setLongitude(hospital.longitude)
      }
    } else {
      // 새 병원 추가 시 ID 생성
      setId(`HOSP${Date.now().toString().slice(-6)}`)
      setName("")
      setLocation("")
      setContactName("")
      setContactPhone("")
      setContractStatus("none")
      setLatitude(37.5665)
      setLongitude(126.978)
    }
  }, [mode, hospitalId, hospitals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hospital: Hospital = {
      id,
      name,
      location,
      contactName,
      contactPhone,
      contractStatus,
      latitude,
      longitude,
    }

    onSubmit(hospital)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="id">병원 ID</Label>
          <Input id="id" value={id} readOnly disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">병원명 *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">위치 *</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">담당자 이름 *</Label>
          <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">연락처 *</Label>
          <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractStatus">계약 상태 *</Label>
          <Select value={contractStatus} onValueChange={setContractStatus} required>
            <SelectTrigger id="contractStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">계약 없음</SelectItem>
              <SelectItem value="pending">계약 진행 중</SelectItem>
              <SelectItem value="completed">계약 완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">위도</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">경도</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">{mode === "add" ? "추가" : "수정"}</Button>
        </div>
      </div>
    </form>
  )
}
