"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getStudents } from "../../services/studentService"
import { exportStudentsToExcel } from "../../services/exportService"
import ExportButton from "../../components/ExportButton"
import { useNotification } from "../../context/NotificationContext"
import "./StudentList.css"

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents()
        setStudents(data)
      } catch (error) {
        console.error("Error fetching students:", error)
        addNotification("error", "Error al cargar los estudiantes")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [addNotification])

  const handleExport = () => {
    if (students.length > 0) {
      const success = exportStudentsToExcel(students, "Lista_Estudiantes")
      if (success) {
        addNotification("success", "Estudiantes exportados exitosamente")
      } else {
        addNotification("error", "Error al exportar estudiantes")
      }
    } else {
      addNotification("warning", "No hay estudiantes para exportar")
    }
  }

  // Resto del componente...

  return (
    <div className="student-list-container">
      <div className="page-header">
        <h1 className="page-title">Lista de Estudiantes</h1>
        <div className="header-actions">
          <ExportButton onClick={handleExport} disabled={loading || students.length === 0} />
          <Link to="/students/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Nuevo Estudiante
          </Link>
        </div>
      </div>

      {/* Resto del JSX... */}
    </div>
  )
}

export default StudentList
