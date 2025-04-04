"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getStudents } from "../services/studentService"
import { getTeachers } from "../services/teacherService"
import { getAttendance } from "../services/attendanceService"
import { getGrades } from "../services/gradeService"
import "./Dashboard.css"

const Dashboard: React.FC = () => {
  const [studentCount, setStudentCount] = useState<number>(0)
  const [teacherCount, setTeacherCount] = useState<number>(0)
  const [attendanceCount, setAttendanceCount] = useState<number>(0)
  const [gradeCount, setGradeCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        const [students, teachers, attendance, grades] = await Promise.all([
          getStudents(),
          getTeachers(),
          getAttendance(),
          getGrades(),
        ])

        setStudentCount(students.length)
        setTeacherCount(teachers.length)
        setAttendanceCount(attendance.length)
        setGradeCount(grades.length)

        setLoading(false)
      } catch (err) {
        setError("Error al cargar los datos del dashboard")
        setLoading(false)
        console.error("Dashboard error:", err)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon student-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="stat-info">
            <h3>Estudiantes</h3>
            <p className="stat-count">{studentCount}</p>
            <Link to="/students" className="stat-link">
              Ver todos
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teacher-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <div className="stat-info">
            <h3>Profesores</h3>
            <p className="stat-count">{teacherCount}</p>
            <Link to="/teachers" className="stat-link">
              Ver todos
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon attendance-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div className="stat-info">
            <h3>Registros de Asistencia</h3>
            <p className="stat-count">{attendanceCount}</p>
            <Link to="/attendance" className="stat-link">
              Ver todos
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon grade-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-info">
            <h3>Calificaciones</h3>
            <p className="stat-count">{gradeCount}</p>
            <Link to="/grades" className="stat-link">
              Ver todos
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="card recent-activity">
          <h2>Actividad Reciente</h2>
          <ul className="activity-list">
            <li className="activity-item">
              <span className="activity-icon">
                <i className="fas fa-user-plus"></i>
              </span>
              <div className="activity-content">
                <p>Nuevo estudiante registrado</p>
                <span className="activity-time">Hace 2 horas</span>
              </div>
            </li>
            <li className="activity-item">
              <span className="activity-icon">
                <i className="fas fa-clipboard-check"></i>
              </span>
              <div className="activity-content">
                <p>Asistencia registrada para la clase de Matemáticas</p>
                <span className="activity-time">Hace 3 horas</span>
              </div>
            </li>
            <li className="activity-item">
              <span className="activity-icon">
                <i className="fas fa-graduation-cap"></i>
              </span>
              <div className="activity-content">
                <p>Nuevas calificaciones añadidas para Ciencias</p>
                <span className="activity-time">Hace 5 horas</span>
              </div>
            </li>
            <li className="activity-item">
              <span className="activity-icon">
                <i className="fas fa-user-edit"></i>
              </span>
              <div className="activity-content">
                <p>Información de profesor actualizada</p>
                <span className="activity-time">Hace 1 día</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="card quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="action-buttons">
            <Link to="/students/new" className="action-btn">
              <i className="fas fa-user-plus"></i>
              <span>Nuevo Estudiante</span>
            </Link>
            <Link to="/teachers/new" className="action-btn">
              <i className="fas fa-user-tie"></i>
              <span>Nuevo Profesor</span>
            </Link>
            <Link to="/attendance/new" className="action-btn">
              <i className="fas fa-clipboard-list"></i>
              <span>Registrar Asistencia</span>
            </Link>
            <Link to="/grades/new" className="action-btn">
              <i className="fas fa-file-alt"></i>
              <span>Añadir Calificación</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

