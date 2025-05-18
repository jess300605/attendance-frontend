"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getClassroomById } from "../services/classroomService"
import { createAttendance } from "../services/attendanceService"
import type { Classroom, Attendance } from "../types"
import "./ClassroomAttendance.css"

const ClassroomAttendance: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const classroomId = id ? Number.parseInt(id, 10) : 0

  // Validar que el ID sea un número válido
  useEffect(() => {
    if (!id || isNaN(classroomId) || classroomId <= 0) {
      toast.error("ID de salón inválido")
      navigate("/dashboard")
    }
  }, [id, classroomId, navigate])

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, Attendance>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // En lugar de usar un Set, usaremos un objeto para rastrear los estudiantes registrados
  const [submittedStudents, setSubmittedStudents] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (classroomId > 0) {
      fetchClassroomData()
    }
  }, [classroomId])

  const fetchClassroomData = async () => {
    try {
      setLoading(true)
      const classroomData = await getClassroomById(classroomId)
      console.log("Classroom data:", classroomData)
      setClassroom(classroomData)

      // Initialize attendance records for all students in the classroom
      if (classroomData.students && classroomData.students.length > 0) {
        console.log("Students found:", classroomData.students.length)
        const initialRecords: Record<number, Attendance> = {}
        classroomData.students.forEach((student) => {
          if (student.id) {
            initialRecords[student.id] = {
              present: true,
              timeIn: new Date().toTimeString().split(" ")[0].substring(0, 5),
              timeOut: "",
              notes: "",
              type: "STUDENT",
              student: { id: student.id },
              date: attendanceDate,
              submitted: false,
            }
          }
        })
        setAttendanceRecords(initialRecords)
      } else {
        console.log("No students found in classroom")
        setError("No hay estudiantes asignados a este salón. Por favor, añade estudiantes primero.")
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching classroom:", err)
      setError("Error al cargar los datos del salón. Por favor, intenta de nuevo más tarde.")
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: number, field: string, value: any) => {
    setAttendanceRecords((prevRecords) => ({
      ...prevRecords,
      [studentId]: {
        ...prevRecords[studentId],
        [field]: value,
      },
    }))
  }

  // Función para alternar el estado de presencia
  const togglePresence = (studentId: number) => {
    setAttendanceRecords((prevRecords) => ({
      ...prevRecords,
      [studentId]: {
        ...prevRecords[studentId],
        present: !prevRecords[studentId].present,
        // Si cambia a ausente, limpiamos las horas
        timeIn: !prevRecords[studentId].present ? new Date().toTimeString().split(" ")[0].substring(0, 5) : "",
        timeOut: !prevRecords[studentId].present ? "" : "",
      },
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceDate(e.target.value)

    // Update date in all attendance records
    setAttendanceRecords((prevRecords) => {
      const updatedRecords = { ...prevRecords }
      Object.keys(updatedRecords).forEach((key) => {
        updatedRecords[Number(key)].date = e.target.value
      })
      return updatedRecords
    })
  }

  const handleSubmitAttendance = async (studentId: number) => {
    if (!attendanceRecords[studentId]) {
      toast.error("No hay registro de asistencia para este estudiante")
      return
    }

    try {
      setSubmitting(true)

      // Prepare the attendance record for this student
      const attendanceRecord = {
        ...attendanceRecords[studentId],
        date: attendanceDate,
        notes: attendanceRecords[studentId].present ? "" : "Ausente sin justificación",
      }

      // Send the attendance record to the server
      await createAttendance(attendanceRecord)

      toast.success("Asistencia registrada correctamente")

      // Mark as submitted in the UI
      setAttendanceRecords((prevRecords) => ({
        ...prevRecords,
        [studentId]: {
          ...prevRecords[studentId],
          submitted: true,
        },
      }))

      // Add to the object of submitted students
      setSubmittedStudents((prev) => ({
        ...prev,
        [studentId]: true,
      }))

      setSubmitting(false)
    } catch (err) {
      toast.error("Error al registrar la asistencia")
      setSubmitting(false)
      console.error("Error submitting attendance:", err)
    }
  }

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true)

      // Submit attendance for all students
      const promises = Object.keys(attendanceRecords).map(async (key) => {
        const studentId = Number(key)
        // Skip already submitted records
        if (submittedStudents[studentId]) {
          return Promise.resolve()
        }

        const attendanceRecord = {
          ...attendanceRecords[studentId],
          date: attendanceDate,
          notes: attendanceRecords[studentId].present ? "" : "Ausente sin justificación",
        }

        return createAttendance(attendanceRecord)
      })

      await Promise.all(promises)

      toast.success("Asistencia registrada para todos los estudiantes")
      navigate(`/classrooms/${classroomId}`)
    } catch (err) {
      toast.error("Error al registrar la asistencia")
      setSubmitting(false)
      console.error("Error submitting all attendance:", err)
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos del salón...</div>
  }

  if (error || !classroom) {
    return (
      <div className="error-container">
        <div className="error">{error || "No se pudo cargar el salón"}</div>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/classrooms/${classroomId}`)}>
            Volver al salón
          </button>
          <button className="btn btn-success" onClick={() => navigate(`/classrooms/${classroomId}/students/add`)}>
            Añadir estudiantes
          </button>
        </div>
      </div>
    )
  }

  // Get students from the classroom
  const students = classroom.students || []

  if (students.length === 0) {
    return (
      <div className="error-container">
        <div className="error">No hay estudiantes asignados a este salón</div>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/classrooms/${classroomId}`)}>
            Volver al salón
          </button>
          <button className="btn btn-success" onClick={() => navigate(`/classrooms/${classroomId}/students/add`)}>
            Añadir estudiantes
          </button>
        </div>
      </div>
    )
  }

  // Calcular estadísticas de asistencia
  const totalStudents = students.length
  const presentStudents = Object.values(attendanceRecords).filter((record) => record.present).length
  const attendanceRate = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0

  return (
    <div className="classroom-attendance">
      <div className="attendance-header">
        <div className="header-info">
          <h1>Sesión de Asistencia</h1>
          <div className="classroom-info">
            <p>
              <strong>Salón:</strong> {classroom.name} ({classroom.courseCode})
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(attendanceDate).toLocaleDateString()}
            </p>
            <div className="date-selector">
              <label htmlFor="attendanceDate">Cambiar Fecha:</label>
              <input
                type="date"
                id="attendanceDate"
                value={attendanceDate}
                onChange={handleDateChange}
                className="form-control"
              />
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/classrooms/${classroomId}`)}>
            Volver
          </button>
          <button className="btn btn-success" onClick={handleSubmitAll} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Todo"}
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
            const updatedRecords = { ...attendanceRecords }
            Object.keys(updatedRecords).forEach((key) => {
              if (!submittedStudents[Number(key)]) {
                updatedRecords[Number(key)].present = true
                updatedRecords[Number(key)].timeIn = new Date().toTimeString().split(" ")[0].substring(0, 5)
              }
            })
            setAttendanceRecords(updatedRecords)
          }}
        >
          Marcar Todos Presentes
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            const updatedRecords = { ...attendanceRecords }
            Object.keys(updatedRecords).forEach((key) => {
              if (!submittedStudents[Number(key)]) {
                updatedRecords[Number(key)].present = false
                updatedRecords[Number(key)].timeIn = ""
                updatedRecords[Number(key)].timeOut = ""
              }
            })
            setAttendanceRecords(updatedRecords)
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentId = student.id as number
              const record = attendanceRecords[studentId]
              const isSubmitted = submittedStudents[studentId] || record?.submitted

              return (
                <tr key={studentId} className={record?.present ? "" : "absent-row"}>
                  <td>
                    {student.firstName} {student.lastName}
                  </td>
                  <td>
                    <button
                      className={`attendance-status-btn ${record?.present ? "present" : "absent"}`}
                      onClick={() => !isSubmitted && togglePresence(studentId)}
                      disabled={isSubmitted}
                    >
                      {record?.present ? "Presente" : "Ausente"}
                    </button>
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control"
                      value={record?.timeIn || ""}
                      onChange={(e) => {
                        handleAttendanceChange(studentId, "timeIn", e.target.value)
                      }}
                      disabled={!record?.present || isSubmitted}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control"
                      value={record?.timeOut || ""}
                      onChange={(e) => {
                        handleAttendanceChange(studentId, "timeOut", e.target.value)
                      }}
                      disabled={!record?.present || isSubmitted}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={record?.present ? "" : "Ausente sin justificación"}
                      value={record?.notes || ""}
                      onChange={(e) => {
                        handleAttendanceChange(studentId, "notes", e.target.value)
                      }}
                      disabled={isSubmitted}
                    />
                  </td>
                  <td>
                    <button
                      className={`btn ${isSubmitted ? "btn-success" : "btn-primary"}`}
                      onClick={() => handleSubmitAttendance(studentId)}
                      disabled={submitting || isSubmitted}
                    >
                      {isSubmitted ? "Registrado" : "Registrar"}
                    </button>
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

export default ClassroomAttendance

