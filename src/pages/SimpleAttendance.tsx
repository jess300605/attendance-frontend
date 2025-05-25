<<<<<<< HEAD
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getClassroomsByTeacher, getClassroomById } from "../services/classroomService"
import {
  getAttendanceSessionsByClassroom,
  createAttendanceSession,
  getAttendanceSessionById,
} from "../services/attendanceSessionService"
import { takeAttendanceForSession } from "../services/attendanceSessionService"
import { getTeacherId } from "../services/authService"
import { exportAttendanceForPrinting, exportSimpleAttendanceByClassroom } from "../services/exportService"
import type { Classroom, AttendanceSession, Attendance } from "../types"
import "./SimpleAttendance.css"
import PrintExportButton from "../components/PrintExportButton"
import SimpleAttendanceExportButton from "../components/SimpleAttendanceExportButton"
import MonthYearPicker from "../components/MonthYearPicker"
import { getGradesByClassroom } from "../services/gradeService"
import { getStudents } from "../services/studentService" // Importar servicio de estudiantes

const SimpleAttendance: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const teacherId = getTeacherId()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [showSessionForm, setShowSessionForm] = useState<boolean>(false)
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [grades, setGrades] = useState<any[]>([])

  // NUEVOS ESTADOS PARA GESTIÓN DE ESTUDIANTES
  const [showStudentManagement, setShowStudentManagement] = useState<boolean>(false)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false)

  // Datos para nueva sesión
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [sessionStartTime, setSessionStartTime] = useState<string>(
    new Date().toTimeString().split(" ")[0].substring(0, 5),
  )
  const [sessionEndTime, setSessionEndTime] = useState<string>("")
  const [sessionTopic, setSessionTopic] = useState<string>("")

  // Estados para la exportación a Excel
  const [showPrintOptions, setShowPrintOptions] = useState<boolean>(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [allAttendanceData, setAllAttendanceData] = useState<any[]>([])

  // Cargar los salones del profesor
  useEffect(() => {
    if (teacherId) {
      fetchClassrooms()
    }
  }, [teacherId])

  // Si hay un classroomId en la URL, cargar ese salón
  useEffect(() => {
    if (classroomId) {
      fetchClassroomDetails(Number.parseInt(classroomId, 10))
    }
  }, [classroomId])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const data = await getClassroomsByTeacher(teacherId as number)
      setClassrooms(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching classrooms:", err)
      setError("Error al cargar los salones")
      setLoading(false)
    }
  }

  const fetchClassroomDetails = async (id: number) => {
    try {
      setLoading(true)
      const data = await getClassroomById(id)
      setSelectedClassroom(data)

      // Cargar las sesiones para este salón
      fetchSessions(id)

      // Cargar las calificaciones para este salón
      try {
        const gradesData = await getGradesByClassroom(id)
        setGrades(gradesData)
      } catch (err) {
        console.error("Error fetching grades:", err)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching classroom details:", err)
      setError("Error al cargar los detalles del salón")
      setLoading(false)
    }
  }

  const fetchSessions = async (classroomId: number) => {
    try {
      const sessions = await getAttendanceSessionsByClassroom(classroomId)
      const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setSessions(sortedSessions)

      // Recopilar todos los datos de asistencia para la exportación
      const allAttendance: any[] = []
      for (const session of sessions) {
        if (session.attendanceRecords && session.attendanceRecords.length > 0) {
          session.attendanceRecords.forEach((record) => {
            if (record.student) {
              allAttendance.push({
                date: session.date,
                studentId: (record.student as any).id,
                present: record.present,
                notes: record.notes || "",
              })
            }
          })
        }
      }
      setAllAttendanceData(allAttendance)
    } catch (err) {
      console.error("Error fetching sessions:", err)
      toast.error("Error al cargar las sesiones")
    }
  }

  // NUEVA FUNCIÓN: Cargar estudiantes disponibles
  const fetchAvailableStudents = async () => {
    try {
      setLoadingStudents(true)
      const allStudents = await getStudents()

      // Filtrar estudiantes que NO están en el salón actual
      const currentStudentIds = selectedClassroom?.students?.map((s) => s.id) || []
      const available = allStudents.filter((student) => !currentStudentIds.includes(student.id))

      setAvailableStudents(available)
      setLoadingStudents(false)
    } catch (err) {
      console.error("Error fetching available students:", err)
      toast.error("Error al cargar estudiantes disponibles")
      setLoadingStudents(false)
    }
  }

  // NUEVA FUNCIÓN: Manejar selección de estudiantes
  const handleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  // NUEVA FUNCIÓN: Agregar estudiantes seleccionados al salón
  const handleAddStudentsToClassroom = async () => {
    if (!selectedClassroom || selectedStudents.length === 0) {
      toast.warning("Selecciona al menos un estudiante")
      return
    }

    try {
      setSubmitting(true)

      // Aquí necesitarías implementar la función en el servicio
      // Por ahora simularemos la actualización
      const updatedStudents = [
        ...(selectedClassroom.students || []),
        ...availableStudents.filter((s) => selectedStudents.includes(s.id)),
      ]

      setSelectedClassroom({
        ...selectedClassroom,
        students: updatedStudents,
      })

      toast.success(`${selectedStudents.length} estudiante(s) agregado(s) al salón`)

      // Limpiar selección y cerrar modal
      setSelectedStudents([])
      setShowStudentManagement(false)

      // Recargar estudiantes disponibles
      await fetchAvailableStudents()

      setSubmitting(false)
    } catch (err) {
      console.error("Error adding students to classroom:", err)
      toast.error("Error al agregar estudiantes al salón")
      setSubmitting(false)
    }
  }

  const handleClassroomSelect = (id: number) => {
    navigate(`/attendance/${id}`)
  }

  const handleSessionSelect = async (session: AttendanceSession) => {
    try {
      setLoading(true)
      const sessionDetails = await getAttendanceSessionById(session.id as number)
      setSelectedSession(sessionDetails)

      if (selectedClassroom?.students && selectedClassroom.students.length > 0) {
        const initialRecords: Record<number, boolean> = {}

        if (sessionDetails.attendanceRecords && sessionDetails.attendanceRecords.length > 0) {
          sessionDetails.attendanceRecords.forEach((record) => {
            if (record.student && (record.student as any).id) {
              initialRecords[(record.student as any).id] = record.present
            }
          })
        } else {
          selectedClassroom.students.forEach((student) => {
            if (student.id) {
              initialRecords[student.id] = true
            }
          })
        }

        setAttendanceRecords(initialRecords)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error selecting session:", err)
      toast.error("Error al seleccionar la sesión")
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!selectedClassroom || !selectedClassroom.id) {
      toast.error("No se ha seleccionado un salón")
      return
    }

    try {
      setSubmitting(true)

      const newSession: AttendanceSession = {
        date: sessionDate,
        startTime: sessionStartTime,
        endTime: sessionEndTime || undefined,
        topic: sessionTopic || undefined,
        classroom: { id: selectedClassroom.id },
      }

      const createdSession = await createAttendanceSession(selectedClassroom.id, newSession)
      toast.success("Sesión creada correctamente")

      await fetchSessions(selectedClassroom.id)
      setSelectedSession(createdSession)
      setShowSessionForm(false)

      if (selectedClassroom.students && selectedClassroom.students.length > 0) {
        const initialRecords: Record<number, boolean> = {}
        selectedClassroom.students.forEach((student) => {
          if (student.id) {
            initialRecords[student.id] = true
          }
        })
        setAttendanceRecords(initialRecords)
      }

      setSubmitting(false)
    } catch (err) {
      console.error("Error creating session:", err)
      toast.error("Error al crear la sesión")
      setSubmitting(false)
    }
  }

  const toggleAttendance = (studentId: number) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  const handleSubmitAttendance = async () => {
    if (!selectedClassroom || !selectedClassroom.students || selectedClassroom.students.length === 0) {
      toast.error("No hay estudiantes para registrar asistencia")
      return
    }

    if (!selectedSession || !selectedSession.id) {
      toast.error("No se ha seleccionado una sesión")
      return
    }

    try {
      setSubmitting(true)

      const attendanceList: Attendance[] = selectedClassroom.students
        .filter((student) => student.id)
        .map((student) => {
          const isPresent = attendanceRecords[student.id as number]

          return {
            present: isPresent,
            timeIn: isPresent ? new Date().toTimeString().split(" ")[0].substring(0, 5) : "",
            timeOut: "",
            notes: isPresent ? "" : "Ausente sin justificación",
            type: "STUDENT",
            student: { id: student.id as number },
            attendanceSession: { id: selectedSession.id as number },
          }
        })

      await takeAttendanceForSession(selectedSession.id, attendanceList)

      toast.success("Asistencia registrada correctamente")
      navigate("/dashboard")
    } catch (err) {
      console.error("Error submitting attendance:", err)
      toast.error("Error al registrar la asistencia")
    } finally {
      setSubmitting(false)
    }
  }

  const markAllPresent = () => {
    if (!selectedClassroom || !selectedClassroom.students) return

    const newRecords: Record<number, boolean> = {}
    selectedClassroom.students.forEach((student) => {
      if (student.id) {
        newRecords[student.id] = true
      }
    })

    setAttendanceRecords(newRecords)
  }

  const markAllAbsent = () => {
    if (!selectedClassroom || !selectedClassroom.students) return

    const newRecords: Record<number, boolean> = {}
    selectedClassroom.students.forEach((student) => {
      if (student.id) {
        newRecords[student.id] = false
      }
    })

    setAttendanceRecords(newRecords)
  }

  const handleExportForPrinting = () => {
    if (!selectedClassroom || !selectedClassroom.students || selectedClassroom.students.length === 0) {
      toast.warning("No hay estudiantes para exportar")
      return
    }

    if (allAttendanceData.length === 0) {
      toast.warning("No hay datos de asistencia para exportar")
      return
    }

    try {
      const success = exportAttendanceForPrinting(
        selectedClassroom.name || "Aula",
        selectedClassroom.students,
        allAttendanceData,
        selectedMonth,
        selectedYear,
        `Asistencia_${selectedClassroom.name}_${selectedMonth}_${selectedYear}`,
        grades,
      )

      if (success) {
        toast.success("Asistencia y calificaciones exportadas exitosamente")
        setShowPrintOptions(false)
      } else {
        toast.error("Error al exportar asistencia y calificaciones")
      }
    } catch (error) {
      console.error("Error exporting attendance:", error)
      toast.error("Error al exportar asistencia")
    }
  }

  const handleExportSimpleAttendance = () => {
    if (!selectedClassroom || !selectedClassroom.name) {
      toast.warning("No hay información del salón para exportar")
      return
    }

    if (allAttendanceData.length === 0) {
      toast.warning("No hay datos de asistencia para exportar")
      return
    }

    try {
      const exportData = allAttendanceData.map((record) => ({
        ...record,
        student: selectedClassroom.students?.find((s) => s.id === record.studentId) || null,
      }))

      const success = exportSimpleAttendanceByClassroom(
        selectedClassroom.name,
        exportData,
        `Asistencia_Simple_${selectedClassroom.name}`,
      )

      if (success) {
        toast.success("Asistencia simple exportada exitosamente")
      } else {
        toast.error("Error al exportar asistencia simple")
      }
    } catch (error) {
      console.error("Error exporting simple attendance:", error)
      toast.error("Error al exportar asistencia")
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  // Si no hay un salón seleccionado, mostrar la lista de salones
  if (!selectedClassroom) {
    return (
      <div className="simple-attendance">
        <h1>Tomar Asistencia</h1>
        <p className="instruction">Selecciona un salón para tomar asistencia:</p>

        {classrooms.length === 0 ? (
          <div className="no-data">No tienes salones asignados</div>
        ) : (
          <div className="classroom-grid">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="classroom-card"
                onClick={() => classroom.id && handleClassroomSelect(classroom.id)}
              >
                <h3>{classroom.name}</h3>
                <p className="course-code">{classroom.courseCode}</p>
                <p className="student-count">
                  <i className="fas fa-user-graduate"></i> {classroom.students?.length || 0} estudiantes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Si hay un salón seleccionado pero no una sesión, mostrar la lista de sesiones o el formulario para crear una
  if (!selectedSession) {
    return (
      <div className="simple-attendance">
        <div className="attendance-header">
          <div>
            <h1>Tomar Asistencia</h1>
            <div className="classroom-info">
              <h2>
                {selectedClassroom.name} ({selectedClassroom.courseCode})
              </h2>
              <p className="student-count">
                <i className="fas fa-user-graduate"></i> {selectedClassroom.students?.length || 0} estudiantes
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/attendance")}>
              Volver
            </button>
            {/* NUEVO BOTÓN: Gestionar Estudiantes */}
            <button
              className="btn btn-info"
              onClick={() => {
                setShowStudentManagement(!showStudentManagement)
                if (!showStudentManagement) {
                  fetchAvailableStudents()
                }
              }}
            >
              <i className="fas fa-users"></i> {showStudentManagement ? "Cerrar" : "Gestionar Estudiantes"}
            </button>
            <button
              className="btn btn-info"
              onClick={() => setShowPrintOptions(!showPrintOptions)}
              disabled={!selectedClassroom.students || selectedClassroom.students.length === 0}
            >
              <i className="fas fa-print"></i> {showPrintOptions ? "Ocultar Opciones" : "Imprimir Asistencia"}
            </button>
            <button className="btn btn-primary" onClick={() => setShowSessionForm(!showSessionForm)}>
              {showSessionForm ? "Cancelar" : "Nueva Sesión"}
            </button>
          </div>
        </div>

        {/* NUEVO PANEL: Gestión de Estudiantes */}
        {showStudentManagement && (
          <div className="student-management-panel">
            <h3>Agregar Estudiantes al Salón</h3>

            {/* Estudiantes actuales del salón */}
            <div className="current-students">
              <h4>Estudiantes Actuales ({selectedClassroom.students?.length || 0})</h4>
              {selectedClassroom.students && selectedClassroom.students.length > 0 ? (
                <div className="student-list-compact">
                  {selectedClassroom.students.map((student) => (
                    <div key={student.id} className="student-item-compact">
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="student-id">({student.studentId})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-students">No hay estudiantes asignados a este salón</p>
              )}
            </div>

            {/* Estudiantes disponibles para agregar */}
            <div className="available-students">
              <h4>Estudiantes Disponibles</h4>
              {loadingStudents ? (
                <div className="loading-students">Cargando estudiantes...</div>
              ) : availableStudents.length > 0 ? (
                <>
                  <div className="student-selection-list">
                    {availableStudents.map((student) => (
                      <div key={student.id} className="student-selection-item">
                        <label className="student-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelection(student.id)}
                          />
                          <span className="checkmark"></span>
                          <div className="student-info">
                            <span className="student-name">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="student-details">
                              ID: {student.studentId} | Email: {student.email}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="student-management-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleAddStudentsToClassroom}
                      disabled={selectedStudents.length === 0 || submitting}
                    >
                      {submitting ? "Agregando..." : `Agregar ${selectedStudents.length} Estudiante(s)`}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedStudents([])}
                      disabled={selectedStudents.length === 0}
                    >
                      Limpiar Selección
                    </button>
                  </div>
                </>
              ) : (
                <p className="no-available-students">No hay estudiantes disponibles para agregar</p>
              )}
            </div>
          </div>
        )}

        {/* Panel de opciones de impresión */}
        {showPrintOptions && (
          <div className="print-options-panel">
            <h3>Opciones de Impresión</h3>
            <p>Selecciona el mes y año para generar el reporte de asistencia:</p>
            <MonthYearPicker
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
            <div className="print-actions">
              <PrintExportButton
                onClick={handleExportForPrinting}
                disabled={
                  !selectedClassroom.students ||
                  selectedClassroom.students.length === 0 ||
                  allAttendanceData.length === 0
                }
              />
              <SimpleAttendanceExportButton
                onClick={handleExportSimpleAttendance}
                disabled={allAttendanceData.length === 0}
                label="Exportar Asistencia Simple"
              />
              <button className="btn btn-outline" onClick={() => setShowPrintOptions(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {showSessionForm ? (
          <div className="session-form">
            <h3>Crear Nueva Sesión</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sessionDate">Fecha:</label>
                <input
                  type="date"
                  id="sessionDate"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionStartTime">Hora de inicio:</label>
                <input
                  type="time"
                  id="sessionStartTime"
                  value={sessionStartTime}
                  onChange={(e) => setSessionStartTime(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionEndTime">Hora de fin:</label>
                <input
                  type="time"
                  id="sessionEndTime"
                  value={sessionEndTime}
                  onChange={(e) => setSessionEndTime(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sessionTopic">Tema:</label>
              <input
                type="text"
                id="sessionTopic"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="form-control"
                placeholder="Tema de la clase (opcional)"
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleCreateSession} disabled={submitting}>
                {submitting ? "Creando..." : "Crear Sesión"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>Selecciona una sesión existente:</h3>

            {sessions.length === 0 ? (
              <div className="no-data">
                No hay sesiones para este salón. Crea una nueva sesión para tomar asistencia.
              </div>
            ) : (
              <div className="session-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-card" onClick={() => handleSessionSelect(session)}>
                    <div className="session-date">
                      <i className="fas fa-calendar-day"></i>
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="session-time">
                      <i className="fas fa-clock"></i>
                      {session.startTime} - {session.endTime || "No definido"}
                    </div>
                    {session.topic && (
                      <div className="session-topic">
                        <i className="fas fa-book"></i>
                        {session.topic}
                      </div>
                    )}
                    <div className="session-attendance">
                      {session.attendanceRecords && session.attendanceRecords.length > 0 ? (
                        <span className="badge badge-success">Asistencia registrada</span>
                      ) : (
                        <span className="badge badge-warning">Asistencia pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Si hay un salón y una sesión seleccionados, mostrar la lista de estudiantes para tomar asistencia
  return (
    <div className="simple-attendance">
      <div className="attendance-header">
        <div>
          <h1>Tomar Asistencia</h1>
          <div className="classroom-info">
            <h2>
              {selectedClassroom.name} ({selectedClassroom.courseCode})
            </h2>
            <div className="session-info">
              <p>
                <strong>Fecha:</strong> {new Date(selectedSession.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Horario:</strong> {selectedSession.startTime} - {selectedSession.endTime || "No definido"}
              </p>
              {selectedSession.topic && (
                <p>
                  <strong>Tema:</strong> {selectedSession.topic}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setSelectedSession(null)}>
            Volver
          </button>
          <button className="btn btn-primary" onClick={handleSubmitAttendance} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Asistencia"}
          </button>
        </div>
      </div>

      <div className="attendance-controls">
        <button className="btn btn-outline-success" onClick={markAllPresent}>
          Marcar Todos Presentes
        </button>
        <button className="btn btn-outline-danger" onClick={markAllAbsent}>
          Marcar Todos Ausentes
        </button>
      </div>

      {selectedClassroom.students && selectedClassroom.students.length > 0 ? (
        <div className="student-list">
          {selectedClassroom.students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <span className="student-name">
                  {student.firstName} {student.lastName}
                </span>
                <span className="student-id">{student.studentId}</span>
              </div>
              <button
                className={`attendance-toggle ${attendanceRecords[student.id as number] ? "present" : "absent"}`}
                onClick={() => student.id && toggleAttendance(student.id)}
              >
                {attendanceRecords[student.id as number] ? (
                  <>
                    <i className="fas fa-check"></i> Presente
                  </>
                ) : (
                  <>
                    <i className="fas fa-times"></i> Ausente
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          No hay estudiantes asignados a este salón.{" "}
          <button
            className="btn btn-link"
            onClick={() => {
              setSelectedSession(null)
              setShowStudentManagement(true)
              fetchAvailableStudents()
            }}
          >
            Agregar estudiantes
          </button>
        </div>
      )}
    </div>
  )
}

export default SimpleAttendance
=======
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getClassroomsByTeacher, getClassroomById } from "../services/classroomService"
import {
  getAttendanceSessionsByClassroom,
  createAttendanceSession,
  getAttendanceSessionById,
} from "../services/attendanceSessionService"
import { takeAttendanceForSession } from "../services/attendanceSessionService"
import { getTeacherId } from "../services/authService"
import type { Classroom, AttendanceSession, Attendance } from "../types"
import "./SimpleAttendance.css"

const SimpleAttendance: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>()
  const navigate = useNavigate()
  const teacherId = getTeacherId()

  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [showSessionForm, setShowSessionForm] = useState<boolean>(false)
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Datos para nueva sesión
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [sessionStartTime, setSessionStartTime] = useState<string>(
    new Date().toTimeString().split(" ")[0].substring(0, 5),
  )
  const [sessionEndTime, setSessionEndTime] = useState<string>("")
  const [sessionTopic, setSessionTopic] = useState<string>("")

  // Cargar los salones del profesor
  useEffect(() => {
    if (teacherId) {
      fetchClassrooms()
    }
  }, [teacherId])

  // Si hay un classroomId en la URL, cargar ese salón
  useEffect(() => {
    if (classroomId) {
      fetchClassroomDetails(Number.parseInt(classroomId, 10))
    }
  }, [classroomId])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const data = await getClassroomsByTeacher(teacherId as number)
      setClassrooms(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching classrooms:", err)
      setError("Error al cargar los salones")
      setLoading(false)
    }
  }

  const fetchClassroomDetails = async (id: number) => {
    try {
      setLoading(true)
      const data = await getClassroomById(id)
      setSelectedClassroom(data)

      // Cargar las sesiones para este salón
      fetchSessions(id)

      setLoading(false)
    } catch (err) {
      console.error("Error fetching classroom details:", err)
      setError("Error al cargar los detalles del salón")
      setLoading(false)
    }
  }

  const fetchSessions = async (classroomId: number) => {
    try {
      const sessions = await getAttendanceSessionsByClassroom(classroomId)
      // Ordenar sesiones por fecha, las más recientes primero
      const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setSessions(sortedSessions)
    } catch (err) {
      console.error("Error fetching sessions:", err)
      toast.error("Error al cargar las sesiones")
    }
  }

  const handleClassroomSelect = (id: number) => {
    navigate(`/attendance/${id}`)
  }

  const handleSessionSelect = async (session: AttendanceSession) => {
    try {
      setLoading(true)
      // Obtener detalles completos de la sesión
      const sessionDetails = await getAttendanceSessionById(session.id as number)
      setSelectedSession(sessionDetails)

      // Inicializar los registros de asistencia
      if (selectedClassroom?.students && selectedClassroom.students.length > 0) {
        const initialRecords: Record<number, boolean> = {}

        // Si la sesión ya tiene registros de asistencia, usarlos
        if (sessionDetails.attendanceRecords && sessionDetails.attendanceRecords.length > 0) {
          sessionDetails.attendanceRecords.forEach((record) => {
            if (record.student && (record.student as any).id) {
              initialRecords[(record.student as any).id] = record.present
            }
          })
        } else {
          // Si no, inicializar todos como presentes
          selectedClassroom.students.forEach((student) => {
            if (student.id) {
              initialRecords[student.id] = true
            }
          })
        }

        setAttendanceRecords(initialRecords)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error selecting session:", err)
      toast.error("Error al seleccionar la sesión")
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!selectedClassroom || !selectedClassroom.id) {
      toast.error("No se ha seleccionado un salón")
      return
    }

    try {
      setSubmitting(true)

      const newSession: AttendanceSession = {
        date: sessionDate,
        startTime: sessionStartTime,
        endTime: sessionEndTime || undefined,
        topic: sessionTopic || undefined,
        classroom: { id: selectedClassroom.id },
      }

      const createdSession = await createAttendanceSession(selectedClassroom.id, newSession)
      toast.success("Sesión creada correctamente")

      // Actualizar la lista de sesiones
      await fetchSessions(selectedClassroom.id)

      // Seleccionar la sesión recién creada
      setSelectedSession(createdSession)
      setShowSessionForm(false)

      // Inicializar los registros de asistencia
      if (selectedClassroom.students && selectedClassroom.students.length > 0) {
        const initialRecords: Record<number, boolean> = {}
        selectedClassroom.students.forEach((student) => {
          if (student.id) {
            initialRecords[student.id] = true
          }
        })
        setAttendanceRecords(initialRecords)
      }

      setSubmitting(false)
    } catch (err) {
      console.error("Error creating session:", err)
      toast.error("Error al crear la sesión")
      setSubmitting(false)
    }
  }

  const toggleAttendance = (studentId: number) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  const handleSubmitAttendance = async () => {
    if (!selectedClassroom || !selectedClassroom.students || selectedClassroom.students.length === 0) {
      toast.error("No hay estudiantes para registrar asistencia")
      return
    }

    if (!selectedSession || !selectedSession.id) {
      toast.error("No se ha seleccionado una sesión")
      return
    }

    try {
      setSubmitting(true)

      // Crear registros de asistencia para cada estudiante
      const attendanceList: Attendance[] = selectedClassroom.students
        .filter((student) => student.id)
        .map((student) => {
          const isPresent = attendanceRecords[student.id as number]

          return {
            present: isPresent,
            timeIn: isPresent ? new Date().toTimeString().split(" ")[0].substring(0, 5) : "",
            timeOut: "",
            notes: isPresent ? "" : "Ausente sin justificación",
            type: "STUDENT",
            student: { id: student.id as number },
            attendanceSession: { id: selectedSession.id as number },
          }
        })

      await takeAttendanceForSession(selectedSession.id, attendanceList)

      toast.success("Asistencia registrada correctamente")
      navigate("/dashboard")
    } catch (err) {
      console.error("Error submitting attendance:", err)
      toast.error("Error al registrar la asistencia")
    } finally {
      setSubmitting(false)
    }
  }

  const markAllPresent = () => {
    if (!selectedClassroom || !selectedClassroom.students) return

    const newRecords: Record<number, boolean> = {}
    selectedClassroom.students.forEach((student) => {
      if (student.id) {
        newRecords[student.id] = true
      }
    })

    setAttendanceRecords(newRecords)
  }

  const markAllAbsent = () => {
    if (!selectedClassroom || !selectedClassroom.students) return

    const newRecords: Record<number, boolean> = {}
    selectedClassroom.students.forEach((student) => {
      if (student.id) {
        newRecords[student.id] = false
      }
    })

    setAttendanceRecords(newRecords)
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  // Si no hay un salón seleccionado, mostrar la lista de salones
  if (!selectedClassroom) {
    return (
      <div className="simple-attendance">
        <h1>Tomar Asistencia</h1>
        <p className="instruction">Selecciona un salón para tomar asistencia:</p>

        {classrooms.length === 0 ? (
          <div className="no-data">No tienes salones asignados</div>
        ) : (
          <div className="classroom-grid">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="classroom-card"
                onClick={() => classroom.id && handleClassroomSelect(classroom.id)}
              >
                <h3>{classroom.name}</h3>
                <p className="course-code">{classroom.courseCode}</p>
                <p className="student-count">
                  <i className="fas fa-user-graduate"></i> {classroom.students?.length || 0} estudiantes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Si hay un salón seleccionado pero no una sesión, mostrar la lista de sesiones o el formulario para crear una
  if (!selectedSession) {
    return (
      <div className="simple-attendance">
        <div className="attendance-header">
          <div>
            <h1>Tomar Asistencia</h1>
            <div className="classroom-info">
              <h2>
                {selectedClassroom.name} ({selectedClassroom.courseCode})
              </h2>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/attendance")}>
              Volver
            </button>
            <button className="btn btn-primary" onClick={() => setShowSessionForm(!showSessionForm)}>
              {showSessionForm ? "Cancelar" : "Nueva Sesión"}
            </button>
          </div>
        </div>

        {showSessionForm ? (
          <div className="session-form">
            <h3>Crear Nueva Sesión</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sessionDate">Fecha:</label>
                <input
                  type="date"
                  id="sessionDate"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionStartTime">Hora de inicio:</label>
                <input
                  type="time"
                  id="sessionStartTime"
                  value={sessionStartTime}
                  onChange={(e) => setSessionStartTime(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sessionEndTime">Hora de fin:</label>
                <input
                  type="time"
                  id="sessionEndTime"
                  value={sessionEndTime}
                  onChange={(e) => setSessionEndTime(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sessionTopic">Tema:</label>
              <input
                type="text"
                id="sessionTopic"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
                className="form-control"
                placeholder="Tema de la clase (opcional)"
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleCreateSession} disabled={submitting}>
                {submitting ? "Creando..." : "Crear Sesión"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>Selecciona una sesión existente:</h3>

            {sessions.length === 0 ? (
              <div className="no-data">
                No hay sesiones para este salón. Crea una nueva sesión para tomar asistencia.
              </div>
            ) : (
              <div className="session-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-card" onClick={() => handleSessionSelect(session)}>
                    <div className="session-date">
                      <i className="fas fa-calendar-day"></i>
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="session-time">
                      <i className="fas fa-clock"></i>
                      {session.startTime} - {session.endTime || "No definido"}
                    </div>
                    {session.topic && (
                      <div className="session-topic">
                        <i className="fas fa-book"></i>
                        {session.topic}
                      </div>
                    )}
                    <div className="session-attendance">
                      {session.attendanceRecords && session.attendanceRecords.length > 0 ? (
                        <span className="badge badge-success">Asistencia registrada</span>
                      ) : (
                        <span className="badge badge-warning">Asistencia pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Si hay un salón y una sesión seleccionados, mostrar la lista de estudiantes para tomar asistencia
  return (
    <div className="simple-attendance">
      <div className="attendance-header">
        <div>
          <h1>Tomar Asistencia</h1>
          <div className="classroom-info">
            <h2>
              {selectedClassroom.name} ({selectedClassroom.courseCode})
            </h2>
            <div className="session-info">
              <p>
                <strong>Fecha:</strong> {new Date(selectedSession.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Horario:</strong> {selectedSession.startTime} - {selectedSession.endTime || "No definido"}
              </p>
              {selectedSession.topic && (
                <p>
                  <strong>Tema:</strong> {selectedSession.topic}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setSelectedSession(null)}>
            Volver
          </button>
          <button className="btn btn-primary" onClick={handleSubmitAttendance} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Asistencia"}
          </button>
        </div>
      </div>

      <div className="attendance-controls">
        <button className="btn btn-outline-success" onClick={markAllPresent}>
          Marcar Todos Presentes
        </button>
        <button className="btn btn-outline-danger" onClick={markAllAbsent}>
          Marcar Todos Ausentes
        </button>
      </div>

      {selectedClassroom.students && selectedClassroom.students.length > 0 ? (
        <div className="student-list">
          {selectedClassroom.students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <span className="student-name">
                  {student.firstName} {student.lastName}
                </span>
                <span className="student-id">{student.studentId}</span>
              </div>
              <button
                className={`attendance-toggle ${attendanceRecords[student.id as number] ? "present" : "absent"}`}
                onClick={() => student.id && toggleAttendance(student.id)}
              >
                {attendanceRecords[student.id as number] ? (
                  <>
                    <i className="fas fa-check"></i> Presente
                  </>
                ) : (
                  <>
                    <i className="fas fa-times"></i> Ausente
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">No hay estudiantes asignados a este salón</div>
      )}
    </div>
  )
}

export default SimpleAttendance
>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1
