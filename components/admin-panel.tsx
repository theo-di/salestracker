"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Button, Box } from "@mui/material"
import SimpleModal from "./SimpleModal"
import EmployeeForm from "./EmployeeForm"

interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  age: number
  group: string
}

interface Group {
  id: number
  name: string
}

const AdminPanel: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [employeeFormMode, setEmployeeFormMode] = useState<"add" | "edit">("add")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)

  useEffect(() => {
    // Fetch employees and groups data from API
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees")
        const data = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups")
        const data = await response.json()
        setGroups(data)
      } catch (error) {
        console.error("Error fetching groups:", error)
      }
    }

    fetchEmployees()
    fetchGroups()
  }, [])

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First name", width: 130 },
    { field: "lastName", headerName: "Last name", width: 130 },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 90,
    },
    {
      field: "group",
      headerName: "Group",
      width: 160,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div>
          <Button size="small" onClick={() => handleEditEmployee(params.row.id)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDeleteEmployee(params.row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const handleAddEmployee = () => {
    setEmployeeFormMode("add")
    setSelectedEmployeeId(null)
    setShowEmployeeForm(true)
  }

  const handleEditEmployee = (id: number) => {
    setEmployeeFormMode("edit")
    setSelectedEmployeeId(id)
    setShowEmployeeForm(true)
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await fetch(`/api/employees/${id}`, { method: "DELETE" })
      setEmployees(employees.filter((employee) => employee.id !== id))
    } catch (error) {
      console.error("Error deleting employee:", error)
    }
  }

  const handleEmployeeSubmit = async (employeeData: Employee) => {
    try {
      if (employeeFormMode === "add") {
        const response = await fetch("/api/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        })
        const newEmployee = await response.json()
        setEmployees([...employees, newEmployee])
      } else {
        const response = await fetch(`/api/employees/${selectedEmployeeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        })
        const updatedEmployee = await response.json()
        setEmployees(employees.map((employee) => (employee.id === selectedEmployeeId ? updatedEmployee : employee)))
      }
      setShowEmployeeForm(false)
    } catch (error) {
      console.error("Error submitting employee:", error)
    }
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="contained" onClick={handleAddEmployee} sx={{ mb: 2 }}>
        Add Employee
      </Button>
      <DataGrid rows={employees} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} autoHeight />

      {showEmployeeForm && (
        <SimpleModal
          isOpen={showEmployeeForm}
          onClose={() => setShowEmployeeForm(false)}
          title={employeeFormMode === "add" ? "직원 추가" : "직원 정보 수정"}
        >
          <EmployeeForm
            mode={employeeFormMode}
            employeeId={selectedEmployeeId}
            employees={employees}
            groups={groups} // 여기서 groups를 전달합니다
            onSubmit={handleEmployeeSubmit}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </SimpleModal>
      )}
    </Box>
  )
}

export default AdminPanel
