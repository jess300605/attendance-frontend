"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getTeacherName } from "../services/authService"
import "./Header.css"

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [teacherName, setTeacherName] = useState<string | null>("Cargando...")

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    // Obtener el nombre del profesor al cargar el componente
    const name = getTeacherName()
    setTeacherName(name || "Usuario")
  }, [])

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-date">
          <span>{currentDate}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Buscar..." />
            <button>
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="user-profile">
            <span className="user-name">{teacherName}</span>
            <div className="avatar">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
