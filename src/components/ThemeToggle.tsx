"use client"

import type React from "react"
import { useEffect, useState } from "react"
import "./ThemeToggle.css"

const ThemeToggle: React.FC = () => {
  // Inicializar con el tema guardado o el tema del sistema
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme === "dark"
    }
    // Detectar preferencia del sistema
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Aplicar el tema cuando cambie el estado
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light")
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  return (
    <div className="theme-toggle-container">
      <button
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {isDarkMode ? (
          <i className="fas fa-sun" aria-hidden="true"></i>
        ) : (
          <i className="fas fa-moon" aria-hidden="true"></i>
        )}
      </button>
    </div>
  )
}

export default ThemeToggle
