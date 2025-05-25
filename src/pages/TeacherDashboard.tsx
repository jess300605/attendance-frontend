<<<<<<< HEAD
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getClassroomsByTeacher } from "../services/classroomService"
import { getTeacherId, getTeacherName } from "../services/authService"
import { exportClassroomFullInfo } from "../services/exportService"
import ClassroomExportButton from "../components/ClassroomExportButton"
import type { Classroom } from "../types"
import { toast } from "react-toastify"
import "./TeacherDashboard.css"

const TeacherDashboard: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const teacherId = getTeacherId()
  const teacherName = getTeacherName()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    if (!teacherId) {
      setError("No se pudo identificar al docente")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getClassroomsByTeacher(teacherId)
      setClassrooms(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los salones asignados")
      setLoading(false)
      console.error("Error fetching classrooms:", err)
    }
  }

  // Función para exportar la información de un salón específico
  const handleExportClassroom = (classroom: Classroom, event?: React.MouseEvent) => {
    // Detener la propagación para evitar que se active el clic en la tarjeta
    if (event) {
      event.stopPropagation()
    }

    if (!classroom) {
      toast.warning("No hay información del salón para exportar")
      return
    }

    try {
      const success = exportClassroomFullInfo(classroom, `Información_Salón_${classroom.name}`)

      if (success) {
        toast.success("Información del salón exportada exitosamente")
      } else {
        toast.error("Error al exportar información del salón")
      }
    } catch (error) {
      console.error("Error exporting classroom info:", error)
      toast.error("Error al exportar información del salón")
    }
  }

  // Función para exportar todos los salones
  const handleExportAllClassrooms = () => {
    if (!classrooms || classrooms.length === 0) {
      toast.warning("No hay salones para exportar")
      return
    }

    try {
      // Crear un libro de trabajo con todos los salones
      let successCount = 0

      classrooms.forEach((classroom) => {
        const success = exportClassroomFullInfo(classroom, `Información_Salón_${classroom.name}`)
        if (success) successCount++
      })

      if (successCount > 0) {
        toast.success(`${successCount} de ${classrooms.length} salones exportados exitosamente`)
      } else {
        toast.error("Error al exportar los salones")
      }
    } catch (error) {
      console.error("Error exporting all classrooms:", error)
      toast.error("Error al exportar los salones")
    }
  }

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {teacherName}</h1>
        <p>Panel de control para docentes</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon classroom-icon">
            <i className="fas fa-chalkboard"></i>
          </div>
          <div className="stat-info">
            <h3>Salones Asignados</h3>
            <p className="stat-count">{classrooms.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-info">
            <h3>Total Estudiantes</h3>
            <p className="stat-count">
              {classrooms.reduce((total, classroom) => total + (classroom.students?.length || 0), 0)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon session-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3>Sesiones Hoy</h3>
            <p className="stat-count">
              {/* Esto sería calculado con datos reales */}
              {Math.floor(Math.random() * 3)}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-classrooms">
        <div className="section-header">
          <h2>Mis Salones</h2>
          <div className="section-actions">
            {classrooms.length > 0 && (
              <ClassroomExportButton onClick={handleExportAllClassrooms} label="Exportar Todos los Salones" />
            )}
            <Link to="/classrooms/new" className="btn btn-primary">
              <i className="fas fa-plus"></i> Nuevo Salón
            </Link>
          </div>
        </div>

        {classrooms.length === 0 ? (
          <div className="no-data">No tienes salones asignados</div>
        ) : (
          <div className="classroom-grid">
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="classroom-card">
                {/* Botón de exportación en la esquina superior derecha */}
                <ClassroomExportButton
              onClick={() => handleExportClassroom(classroom)}
              className="card-export-button"
                label=""
                  />

                <div className="classroom-header">
                  <h3>{classroom.name}</h3>
                  <span className="course-code">{classroom.courseCode}</span>
                </div>
                <div className="classroom-body">
                  <p>{classroom.description || "Sin descripción"}</p>
                  <div className="classroom-stats">
                    <div className="classroom-stat">
                      <i className="fas fa-user-graduate"></i>
                      <span>{classroom.students?.length || 0} estudiantes</span>
                    </div>
                    <div className="classroom-stat">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{classroom.attendanceSessions?.length || 0} sesiones</span>
                    </div>
                  </div>
                </div>
                <div className="classroom-actions">
                  <Link to={`/classrooms/${classroom.id}`} className="btn btn-primary">
                    Ver Detalles
                  </Link>
                  <Link to={`/attendance/${classroom.id}`} className="btn btn-success">
                    Tomar Asistencia
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <div className="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div className="action-buttons">
          <Link to="/attendance" className="action-btn">
            <i className="fas fa-clipboard-list"></i>
            <span>Tomar Asistencia</span>
          </Link>
          <Link to="/grades" className="action-btn">
            <i className="fas fa-graduation-cap"></i>
            <span>Calificaciones</span>
          </Link>
          <Link to="/reports" className="action-btn">
            <i className="fas fa-chart-bar"></i>
            <span>Reportes</span>
          </Link>
          <Link to="/students" className="action-btn">
            <i className="fas fa-users"></i>
            <span>Estudiantes</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
=======
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getClassroomsByTeacher } from "../services/classroomService"
import { getTeacherId, getTeacherName } from "../services/authService"
import type { Classroom } from "../types"
import "./TeacherDashboard.css"

const TeacherDashboard: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const teacherId = getTeacherId()
  const teacherName = getTeacherName()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    if (!teacherId) {
      setError("No se pudo identificar al docente")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getClassroomsByTeacher(teacherId)
      setClassrooms(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los salones asignados")
      setLoading(false)
      console.error("Error fetching classrooms:", err)
    }
  }

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {teacherName}</h1>
        <p>Panel de control para docentes</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon classroom-icon">
            <i className="fas fa-chalkboard"></i>
          </div>
          <div className="stat-info">
            <h3>Salones Asignados</h3>
            <p className="stat-count">{classrooms.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon student-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-info">
            <h3>Total Estudiantes</h3>
            <p className="stat-count">
              {classrooms.reduce((total, classroom) => total + (classroom.students?.length || 0), 0)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon session-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3>Sesiones Hoy</h3>
            <p className="stat-count">
              {/* Esto sería calculado con datos reales */}
              {Math.floor(Math.random() * 3)}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-classrooms">
        <div className="section-header">
          <h2>Mis Salones</h2>
          <Link to="/classrooms/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Nuevo Salón
          </Link>
        </div>

        {classrooms.length === 0 ? (
          <div className="no-data">No tienes salones asignados</div>
        ) : (
          <div className="classroom-grid">
            {classrooms.map((classroom) => (
              <div key={classroom.id} className="classroom-card">
                <div className="classroom-header">
                  <h3>{classroom.name}</h3>
                  <span className="course-code">{classroom.courseCode}</span>
                </div>
                <div className="classroom-body">
                  <p>{classroom.description || "Sin descripción"}</p>
                  <div className="classroom-stats">
                    <div className="classroom-stat">
                      <i className="fas fa-user-graduate"></i>
                      <span>{classroom.students?.length || 0} estudiantes</span>
                    </div>
                    <div className="classroom-stat">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{classroom.attendanceSessions?.length || 0} sesiones</span>
                    </div>
                  </div>
                </div>
                <div className="classroom-actions">
                  <Link to={`/classrooms/${classroom.id}`} className="btn btn-primary">
                    Ver Detalles
                  </Link>
                  <Link to={`/attendance/${classroom.id}`} className="btn btn-success">
                    Tomar Asistencia
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-actions">
        <div className="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div className="action-buttons">
          <Link to="/attendance" className="action-btn">
            <i className="fas fa-clipboard-list"></i>
            <span>Tomar Asistencia</span>
          </Link>
          <Link to="/grades" className="action-btn">
            <i className="fas fa-graduation-cap"></i>
            <span>Calificaciones</span>
          </Link>
          <Link to="/reports" className="action-btn">
            <i className="fas fa-chart-bar"></i>
            <span>Reportes</span>
          </Link>
          <Link to="/students" className="action-btn">
            <i className="fas fa-users"></i>
            <span>Estudiantes</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1
