"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getClassroomById, deleteClassroom } from "../services/classroomService"
import { getAttendanceSessionsByClassroom } from "../services/attendanceSessionService"
import { getGradesByClassroom } from "../services/gradeService"
import type { Classroom, AttendanceSession, Grade } from "../types"
import "./ClassroomDetail.css"

const ClassroomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "students" | "sessions" | "grades">("info")

  useEffect(() => {
    fetchClassroomData()
  }, [id])

  const fetchClassroomData = async () => {
    try {
      setLoading(true)

      const classroomId = Number.parseInt(id as string)
      const [classroomData, sessionsData, gradesData] = await Promise.all([
        getClassroomById(classroomId),
        getAttendanceSessionsByClassroom(classroomId),
        getGradesByClassroom(classroomId),
      ])

      setClassroom(classroomData)
      setSessions(sessionsData)
      setGrades(gradesData)

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del salón")
      setLoading(false)
      console.error("Error fetching classroom data:", err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este salón?")) {
      try {
        await deleteClassroom(Number.parseInt(id as string))
        toast.success("Salón eliminado correctamente")
        navigate("/dashboard")
      } catch (err) {
        toast.error("Error al eliminar el salón")
        console.error("Error deleting classroom:", err)
      }
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos del salón...</div>
  }

  if (error || !classroom) {
    return <div className="error">{error || "No se pudo cargar el salón"}</div>
  }

  return (
    <div className="classroom-detail">
      <div className="detail-header">
        <div className="header-info">
          <h1>{classroom.name}</h1>
          <span className="course-code">{classroom.courseCode}</span>
        </div>
        <div className="header-actions">
          <Link to={`/classrooms/${id}/attendance`} className="btn btn-success">
            <i className="fas fa-clipboard-check"></i> Tomar Asistencia
          </Link>
          <Link to={`/classrooms/edit/${id}`} className="btn btn-primary">
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
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Estudiantes
        </button>
        <button
          className={`tab-btn ${activeTab === "sessions" ? "active" : ""}`}
          onClick={() => setActiveTab("sessions")}
        >
          Sesiones
        </button>
        <button className={`tab-btn ${activeTab === "grades" ? "active" : ""}`} onClick={() => setActiveTab("grades")}>
          Calificaciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "info" && (
          <div className="info-tab">
            <div className="info-group">
              <label>Descripción:</label>
              <p>{classroom.description || "Sin descripción"}</p>
            </div>
            <div className="info-group">
              <label>Profesor:</label>
              <p>
                {(classroom.teacher as any).firstName
                  ? `${(classroom.teacher as any).firstName} ${(classroom.teacher as any).lastName}`
                  : "No asignado"}
              </p>
            </div>
            <div className="info-group">
              <label>Total de Estudiantes:</label>
              <p>{classroom.students?.length || 0}</p>
            </div>
            <div className="info-group">
              <label>Total de Sesiones:</label>
              <p>{sessions.length}</p>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="students-tab">
            <div className="tab-actions">
              <Link to={`/classrooms/${id}/students/add`} className="btn btn-primary">
                <i className="fas fa-user-plus"></i> Agregar Estudiantes
              </Link>
            </div>

            {classroom.students && classroom.students.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>ID Estudiante</th>
                      <th>Email</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classroom.students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.id}</td>
                        <td>{student.firstName}</td>
                        <td>{student.lastName}</td>
                        <td>{student.studentId}</td>
                        <td>{student.email}</td>
                        <td className="actions">
                          <Link to={`/students/${student.id}`} className="btn-action view">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            className="btn-action delete"
                            onClick={() => {
                              // Implementar la lógica para eliminar estudiante del salón
                              toast.info("Funcionalidad en desarrollo")
                            }}
                          >
                            <i className="fas fa-user-minus"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">No hay estudiantes asignados a este salón</div>
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="sessions-tab">
            <div className="tab-actions">
              <Link to={`/attendance-sessions/new?classroomId=${id}`} className="btn btn-primary">
                <i className="fas fa-plus"></i> Nueva Sesión
              </Link>
            </div>

            {sessions.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora Inicio</th>
                      <th>Hora Fin</th>
                      <th>Tema</th>
                      <th>Asistencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>{new Date(session.date).toLocaleDateString()}</td>
                        <td>{session.startTime}</td>
                        <td>{session.endTime || "-"}</td>
                        <td>{session.topic || "-"}</td>
                        <td>
                          {session.attendanceRecords ? (
                            <span>
                              {session.attendanceRecords.filter((record) => record.present).length} /{" "}
                              {session.attendanceRecords.length}
                            </span>
                          ) : (
                            "No registrada"
                          )}
                        </td>
                        <td className="actions">
                          <Link to={`/attendance-sessions/${session.id}`} className="btn-action view">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/attendance-sessions/${session.id}/take`} className="btn-action edit">
                            <i className="fas fa-clipboard-check"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">No hay sesiones registradas para este salón</div>
            )}
          </div>
        )}

        {activeTab === "grades" && (
          <div className="grades-tab">
            <div className="tab-actions">
              <Link to={`/grades/new?classroomId=${id}`} className="btn btn-primary">
                <i className="fas fa-plus"></i> Agregar Calificaciones
              </Link>
            </div>

            {grades.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Tipo de Evaluación</th>
                      <th>Calificación</th>
                      <th>Fecha</th>
                      <th>Comentarios</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td>
                          {(grade.student as any).firstName
                            ? `${(grade.student as any).firstName} ${(grade.student as any).lastName}`
                            : "Estudiante"}
                        </td>
                        <td>{grade.evaluationType}</td>
                        <td className="grade-score">{grade.score}</td>
                        <td>{new Date(grade.date).toLocaleDateString()}</td>
                        <td>{grade.comments || "-"}</td>
                        <td className="actions">
                          <Link to={`/grades/edit/${grade.id}`} className="btn-action edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn-action delete"
                            onClick={() => {
                              // Implementar la lógica para eliminar calificación
                              toast.info("Funcionalidad en desarrollo")
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">No hay calificaciones registradas para este salón</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassroomDetail

