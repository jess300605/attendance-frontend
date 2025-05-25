"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getTeacherById, deleteTeacher } from "../../services/teacherService"
import { getAttendanceByTeacher } from "../../services/attendanceService"
import type { Teacher, Attendance } from "../../types"
import "./TeacherDetail.css"

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "attendance">("info")

  useEffect(() => {
    fetchTeacherData()
  }, [id])

  const fetchTeacherData = async () => {
    try {
      setLoading(true)

      const teacherId = Number.parseInt(id as string)
      const [teacherData, attendanceData] = await Promise.all([
        getTeacherById(teacherId),
        getAttendanceByTeacher(teacherId),
      ])

      setTeacher(teacherData)
      setAttendance(attendanceData)

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del profesor")
      setLoading(false)
      console.error("Error fetching teacher data:", err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este profesor?")) {
      try {
        await deleteTeacher(Number.parseInt(id as string))
        toast.success("Profesor eliminado correctamente")
        navigate("/teachers")
      } catch (err) {
        toast.error("Error al eliminar el profesor")
        console.error("Error deleting teacher:", err)
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos del profesor...</div>
  }

  if (error || !teacher) {
    return <div className="error">{error || "No se pudo cargar el profesor"}</div>
  }

  return (
    <div className="teacher-detail">
      <div className="detail-header">
        <h1>
          {teacher.firstName} {teacher.lastName}
        </h1>
        <div className="header-actions">
          <Link to={`/teachers/edit/${id}`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Editar
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
          Información
        </button>
        <button
          className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Asistencia
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "info" && (
          <div className="info-tab">
            <div className="info-group">
              <label>ID Empleado:</label>
              <p>{teacher.employeeId}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{teacher.email}</p>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-tab">
            {attendance.length === 0 ? (
              <p className="no-data">No hay registros de asistencia</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                    <th>Presente</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date((record.attendanceSession as any).date).toLocaleDateString()}</td>
                      <td>{record.timeIn}</td>
                      <td>{record.timeOut || "-"}</td>
                      <td>
                        <span className={`badge ${record.present ? "badge-success" : "badge-danger"}`}>
                          {record.present ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="tab-actions">
              <Link to={`/attendance/new?teacherId=${id}`} className="btn btn-primary">
                <i className="fas fa-plus"></i> Registrar Asistencia
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDetail

