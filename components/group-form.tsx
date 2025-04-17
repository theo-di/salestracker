"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Group } from "@/types/group"

interface GroupFormProps {
  mode: "add" | "edit"
  groupId: string | null
  groups: Group[]
  onSubmit: (group: Group) => void
  onCancel: () => void
}

export default function GroupForm({ mode, groupId, groups, onSubmit, onCancel }: GroupFormProps) {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (mode === "edit" && groupId) {
      const group = groups.find((g) => g.id === groupId)
      if (group) {
        setId(group.id)
        setName(group.name)
        setDescription(group.description || "")
      }
    } else {
      // 새 그룹 추가 시 ID 생성
      setId(`GRP${Date.now().toString().slice(-6)}`)
      setName("")
      setDescription("")
    }
  }, [mode, groupId, groups])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const group: Group = {
      id,
      name,
      description,
      createdAt: new Date(),
    }

    onSubmit(group)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="id">그룹 ID</Label>
          <Input id="id" value={id} readOnly disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">그룹명 *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit">{mode === "add" ? "추가" : "수정"}</Button>
        </div>
      </div>
    </form>
  )
}
