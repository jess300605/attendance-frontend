"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getStudentById, deleteStudent } from "../../services/studentService"
import { getGradesByStudent } from "../../services/gradeService"
import { getAttendanceByStudent } from "../../services/attendanceService"
import type { Student, Grade, Attendance } from "../../types"
import "./StudentDetail.css"

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [student, setStudent] = useState<Student | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "grades" | "attendance">("info")

  useEffect(() => {
    fetchStudentData()
  }, [id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)

      const studentId = Number.parseInt(id as string)
      const [studentData, gradesData, attendanceData] = await Promise.all([
        getStudentById(studentId),
        getGradesByStudent(studentId),
        getAttendanceByStudent(studentId),
      ])

      setStudent(studentData)
      setGrades(gradesData)
      setAttendance(attendanceData)

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del estudiante")
      setLoading(false)
      console.error("Error fetching student data:", err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
      try {
        await deleteStudent(Number.parseInt(id as string))
        toast.success("Estudiante eliminado correctamente")
        navigate("/students")
      } catch (err) {
        toast.error("Error al eliminar el estudiante")
        console.error("Error deleting student:", err)
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos del estudiante...</div>
  }

  if (error || !student) {
    return <div className="error">{error || "No se pudo cargar el estudiante"}</div>
  }

  return (
    <div className="student-detail">
      <div className="detail-header">
        <h1>
          {student.firstName} {student.lastName}
        </h1>
        <div className="header-actions">
          <Link to={`/students/edit/${id}`} className="btn btn-primary">
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
        <button className={`tab-btn ${activeTab === "grades" ? "active" : ""}`} onClick={() => setActiveTab("grades")}>
          Calificaciones
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
              <label>ID Estudiante:</label>
              <p>{student.studentId}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{student.email}</p>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="grades-tab">
            {grades.length === 0 ? (
              <p className="no-data">No hay calificaciones registradas</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Calificación</th>
                    <th>Fecha</th>
                    <th>Comentarios</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.evaluationType}</td>
                      <td>{grade.score}</td>
                      <td>{new Date(grade.date).toLocaleDateString()}</td>
                      <td>{grade.comments || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="tab-actions">
              <Link to={`/grades/new?studentId=${id}`} className="btn btn-primary">
                <i className="fas fa-plus"></i> Añadir Calificación
              </Link>
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
              <Link to={`/attendance/new?studentId=${id}`} className="btn btn-primary">
                <i className="fas fa-plus"></i> Registrar Asistencia
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetail

