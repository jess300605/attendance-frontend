"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { login } from "../services/authService"
import type { TeacherLogin } from "../types"
import "./Login.css"

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<TeacherLogin>({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      toast.error("Por favor ingrese su correo y contraseña")
      return
    }

    try {
      setLoading(true)
      const response = await login(credentials)

      if (response.attendanceRegistered) {
        toast.success("Asistencia registrada automáticamente")
      }

      navigate("/dashboard")
    } catch (error) {
      toast.error("Credenciales inválidas")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema de Asistencia</h1>
          <p>Acceso para Docentes</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="form-control"
              placeholder="correo@escuela.edu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-control"
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>Al iniciar sesión, su asistencia será registrada automáticamente.</p>
        </div>
      </div>
    </div>
  )
}

export default Login

