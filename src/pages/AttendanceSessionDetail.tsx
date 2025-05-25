"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getAttendanceSessionById, deleteAttendanceSession } from "../services/attendanceSessionService"
import type { AttendanceSession, Attendance } from "../types"
import "./AttendanceSessionDetail.css"

const AttendanceSessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessionData()
  }, [id])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const sessionData = await getAttendanceSessionById(Number.parseInt(id as string))
      setSession(sessionData)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos de la sesión")
      setLoading(false)
      console.error("Error fetching session:", err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sesión de asistencia?")) {
      try {
        await deleteAttendanceSession(Number.parseInt(id as string))
        toast.success("Sesión de asistencia eliminada correctamente")
        navigate("/attendance-sessions")
      } catch (err) {
        toast.error("Error al eliminar la sesión de asistencia")
        console.error("Error deleting session:", err)
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos de la sesión...</div>
  }

  if (error || !session) {
    return <div className="error">{error || "No se pudo cargar la sesión"}</div>
  }

  // Calculate attendance statistics
  const totalStudents = session.attendanceRecords?.length || 0
  const presentStudents = session.attendanceRecords?.filter((record) => record.present).length || 0
  const attendanceRate = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0

  return (
    <div className="attendance-session-detail">
      <div className="detail-header">
        <div className="header-info">
          <h1>Sesión de Asistencia</h1>
          <div className="session-info">
            <p>
              <strong>Salón:</strong>{" "}
              {(session.classroom as any).name
                ? `${(session.classroom as any).name} (${(session.classroom as any).courseCode})`
                : "Salón"}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(session.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Horario:</strong> {session.startTime} - {session.endTime || "No definido"}
            </p>
            {session.topic && (
              <p>
                <strong>Tema:</strong> {session.topic}
              </p>
            )}
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/attendance-sessions/edit/${id}`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Editar
          </Link>
          <Link to={`/attendance-sessions/${id}/take`} className="btn btn-success">
            <i className="fas fa-clipboard-check"></i> Tomar Asistencia
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>

      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-title">Total Estudiantes</div>
          <div className="stat-value">{totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Presentes</div>
          <div className="stat-value">{presentStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tasa de Asistencia</div>
          <div className="stat-value">{attendanceRate.toFixed(2)}%</div>
        </div>
      </div>

      {session.notes && (
        <div className="session-notes">
          <h3>Notas</h3>
          <p>{session.notes}</p>
        </div>
      )}

      <div className="attendance-records">
        <h2>Registros de Asistencia</h2>

        {!session.attendanceRecords || session.attendanceRecords.length === 0 ? (
          <div className="no-data">No hay registros de asistencia para esta sesión</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Presente</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {session.attendanceRecords.map((record: Attendance) => (
                  <tr key={record.id} className={record.present ? "" : "absent-row"}>
                    <td>
                      {(record.student as any).firstName
                        ? `${(record.student as any).firstName} ${(record.student as any).lastName}`
                        : "Estudiante"}
                    </td>
                    <td>
                      <span className={`badge ${record.present ? "badge-success" : "badge-danger"}`}>
                        {record.present ? "Presente" : "Ausente"}
                      </span>
                    </td>
                    <td>{record.timeIn || "-"}</td>
                    <td>{record.timeOut || "-"}</td>
                    <td>{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceSessionDetail

