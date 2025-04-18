"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus } from "lucide-react"
import SimpleModal from "./simple-modal"
import type { Group } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GroupManagementProps {
  groups: Group[]
  onAddGroup: (group: Group) => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
}

export default function GroupManagement({ groups, onAddGroup, onEditGroup, onDeleteGroup }: GroupManagementProps) {
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddGroup = () => {
    setFormMode("add")
    setSelectedGroupId(null)
    setGroupName("")
    setError(null)
    setShowGroupForm(true)
  }

  const handleEditGroup = (group: Group) => {
    setFormMode("edit")
    setSelectedGroupId(group.id)
    setGroupName(group.name)
    setError(null)
    setShowGroupForm(true)
  }

  const handleDeleteConfirmation = (groupId: string) => {
    setDeleteConfirmation(groupId)
  }

  const confirmDelete = () => {
    if (deleteConfirmation) {
      onDeleteGroup(deleteConfirmation)
      setDeleteConfirmation(null)
    }
  }

  const handleSubmit = () => {
    if (!groupName.trim()) {
      setError("지점명을 입력해주세요.")
      return
    }

    // 중복 이름 체크
    const isDuplicate = groups.some(
      (group) => group.name.toLowerCase() === groupName.trim().toLowerCase() && group.id !== selectedGroupId,
    )

    if (isDuplicate) {
      setError("이미 존재하는 지점명입니다.")
      return
    }

    if (formMode === "add") {
      // 새 ID 생성 (현재 시간 기반)
      const newId = `G${Date.now().toString()}`
      onAddGroup({ id: newId, name: groupName.trim() })
    } else if (formMode === "edit" && selectedGroupId) {
      onEditGroup({ id: selectedGroupId, name: groupName.trim() })
    }

    setShowGroupForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">지점 관리</h2>
        <Button onClick={handleAddGroup}>
          <Plus className="h-4 w-4 mr-2" />
          지점 추가
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>지점 ID</TableHead>
            <TableHead>지점명</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                등록된 지점이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.id}</TableCell>
                <TableCell>{group.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditGroup(group)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteConfirmation(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 그룹 추가/수정 모달 */}
      <SimpleModal
        isOpen={showGroupForm}
        onClose={() => setShowGroupForm(false)}
        title={formMode === "add" ? "지점 추가" : "지점명 수정"}
      >
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="groupName">지점명</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="지점명을 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowGroupForm(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {formMode === "add" ? "추가" : "수정"}
            </Button>
          </div>
        </div>
      </SimpleModal>

      {/* 삭제 확인 모달 */}
      <SimpleModal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        title="지점 삭제 확인"
      >
        <div className="space-y-4">
          <p>정말 이 지점을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <p className="text-sm text-gray-500">
            해당 지점에 소속된 직원들은 지점 정보가 삭제됩니다. 필요한 경우 직원 정보를 먼저 수정해주세요.
          </p>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmation(null)}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
