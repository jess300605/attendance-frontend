"use client"

import type React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { logout, getTeacherName } from "../services/authService"
import "./Sidebar.css"

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const teacherName = getTeacherName()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Sistema de Asistencia</h1>
      </div>

      <div className="user-profile">
        <div className="avatar">
          <i className="fas fa-user"></i>
        </div>
        <div className="user-info">
          <span className="user-name">{teacherName || "Docente"}</span>
          <span className="user-role">Profesor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" end>
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/students">
              <i className="fas fa-user-graduate"></i>
              <span>Estudiantes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/attendance">
              <i className="fas fa-clipboard-check"></i>
              <span>Asistencia</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/grades">
              <i className="fas fa-graduation-cap"></i>
              <span>Calificaciones</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports">
              <i className="fas fa-chart-bar"></i>
              <span>Reportes</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
        <p>© 2023 Sistema de Asistencia</p>
      </div>
    </aside>
  )
}

export default Sidebar

