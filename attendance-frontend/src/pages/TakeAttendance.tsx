"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getAttendanceSessionById } from "../services/attendanceSessionService"
import { takeAttendanceForSession } from "../services/attendanceSessionService"
import type { AttendanceSession, Attendance, Student } from "../types"
import "./TakeAttendance.css"

const TakeAttendance: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionId = id ? Number.parseInt(id, 10) : 0

  // Validar que el ID sea un número válido
  useEffect(() => {
    if (!id || isNaN(sessionId) || sessionId <= 0) {
      toast.error("ID de sesión inválido")
      navigate("/attendance-sessions")
    }
  }, [id, sessionId, navigate])

  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // Mantener un registro de los estudiantes que ya han sido registrados
  const [submittedStudents, setSubmittedStudents] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (sessionId > 0) {
      fetchSessionData()
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const sessionData = await getAttendanceSessionById(sessionId)
      setSession(sessionData)

      // Initialize attendance records for all students in the classroom
      if (sessionData.classroom && (sessionData.classroom as any).students) {
        const students = (sessionData.classroom as any).students as Student[]
        if (students && students.length > 0) {
          const records = students
            .filter((student) => student.id !== undefined) // Filtramos estudiantes sin id
            .map((student) => ({
              present: true,
              timeIn: new Date().toTimeString().split(" ")[0].substring(0, 5),
              timeOut: "",
              notes: "",
              type: "STUDENT" as "STUDENT" | "TEACHER",
              student: { id: student.id as number }, // Aseguramos que id es number
              attendanceSession: { id: sessionData.id as number }, // Aseguramos que id es number
              submitted: false,
            }))

          setAttendanceRecords(records)
        } else {
          setError("No hay estudiantes asignados a este salón")
        }
      } else {
        setError("No hay estudiantes asignados a este salón")
      }

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos de la sesión")
      setLoading(false)
      console.error("Error fetching session:", err)
    }
  }

  const handleAttendanceChange = (index: number, field: string, value: any) => {
    setAttendanceRecords((prevRecords) => {
      const newRecords = [...prevRecords]
      newRecords[index] = {
        ...newRecords[index],
        [field]: value,
      }
      return newRecords
    })
  }

  // Función para alternar el estado de presencia
  const togglePresence = (index: number) => {
    setAttendanceRecords((prevRecords) => {
      const newRecords = [...prevRecords]
      const isNowPresent = !newRecords[index].present

      newRecords[index] = {
        ...newRecords[index],
        present: isNowPresent,
        // Si cambia a presente, establecemos la hora actual, si no, limpiamos las horas
        timeIn: isNowPresent ? new Date().toTimeString().split(" ")[0].substring(0, 5) : "",
        timeOut: "",
        notes: isNowPresent ? "" : "Ausente sin justificación",
      }
      return newRecords
    })
  }

  const handleSubmit = async () => {
    if (!sessionId || isNaN(sessionId) || sessionId <= 0) {
      toast.error("ID de sesión inválido")
      return
    }

    try {
      setSubmitting(true)

      await takeAttendanceForSession(sessionId, attendanceRecords)

      toast.success("Asistencia registrada correctamente")

      // Navigate back to session detail or classroom
      if (session && (session.classroom as any).id) {
        navigate(`/classrooms/${(session.classroom as any).id}`)
      } else {
        navigate("/attendance-sessions")
      }
    } catch (err) {
      toast.error("Error al registrar la asistencia")
      setSubmitting(false)
      console.error("Error taking attendance:", err)
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos de la sesión...</div>
  }

  if (error || !session) {
    return <div className="error">{error || "No se pudo cargar la sesión"}</div>
  }

  // Get students from the classroom
  const students = ((session.classroom as any).students as Student[]) || []

  if (!students || students.length === 0) {
    return <div className="error">No hay estudiantes asignados a este salón</div>
  }

  // Calcular estadísticas de asistencia
  const totalStudents = students.length
  const presentStudents = attendanceRecords.filter((record) => record.present).length
  const attendanceRate = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0

  return (
    <div className="take-attendance">
      <div className="attendance-header">
        <div className="header-info">
          <h1>Sesión de Asistencia</h1>
          <div className="session-info">
            <p>
              <strong>Salón:</strong> {(session.classroom as any).name} ({(session.classroom as any).courseCode})
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(session.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Hora:</strong> {session.startTime} - {session.endTime || "No definida"}
            </p>
            {session.topic && (
              <p>
                <strong>Tema:</strong> {session.topic}
              </p>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/attendance-sessions/${sessionId}`)}>
            Volver
          </button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Asistencia"}
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

      <div className="attendance-controls">
        <button
          className="btn btn-outline-success"
          onClick={() => {
            setAttendanceRecords((prevRecords) =>
              prevRecords.map((record) => ({
                ...record,
                present: true,
                timeIn: new Date().toTimeString().split(" ")[0].substring(0, 5),
                notes: "",
              })),
            )
          }}
        >
          Marcar Todos Presentes
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            setAttendanceRecords((prevRecords) =>
              prevRecords.map((record) => ({
                ...record,
                present: false,
                timeIn: "",
                timeOut: "",
                notes: "Ausente sin justificación",
              })),
            )
          }}
        >
          Marcar Todos Ausentes
        </button>
      </div>

      <h2 className="section-title">Registros de Asistencia</h2>

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
            {attendanceRecords.map((record, index) => {
              const student = students.find((s) => s.id === (record.student as any).id)

              return (
                <tr key={index} className={record.present ? "" : "absent-row"}>
                  <td>{student ? `${student.firstName} ${student.lastName}` : "Estudiante"}</td>
                  <td>
                    <button
                      className={`attendance-status-btn ${record.present ? "present" : "absent"}`}
                      onClick={() => togglePresence(index)}
                    >
                      {record.present ? "Presente" : "Ausente"}
                    </button>
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control"
                      value={record.timeIn || ""}
                      onChange={(e) => {
                        handleAttendanceChange(index, "timeIn", e.target.value)
                      }}
                      disabled={!record.present}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control"
                      value={record.timeOut || ""}
                      onChange={(e) => {
                        handleAttendanceChange(index, "timeOut", e.target.value)
                      }}
                      disabled={!record.present}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={record.present ? "" : "Ausente sin justificación"}
                      value={record.notes || ""}
                      onChange={(e) => {
                        handleAttendanceChange(index, "notes", e.target.value)
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TakeAttendance


