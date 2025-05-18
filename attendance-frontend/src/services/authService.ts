import api from "./api"
import type { TeacherLogin, TeacherLoginResponse } from "../types"

export const login = async (credentials: TeacherLogin): Promise<TeacherLoginResponse> => {
  try {
    console.log("Sending login request:", credentials)
    const response = await api.post<TeacherLoginResponse>("/auth/login", credentials)
    console.log("Login response:", response.data)

    // Mostrar el token en la consola
    if (response.data && response.data.token) {
      console.log("JWT Token:", response.data.token)

      // Desglosar el token para ver su contenido
      const tokenParts = response.data.token.split(".")
      if (tokenParts.length === 3) {
        const header = JSON.parse(atob(tokenParts[0]))
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log("Token Header:", header)
        console.log("Token Payload:", payload)
      }

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("teacherId", response.data.id.toString())
      localStorage.setItem("teacherName", `${response.data.firstName} ${response.data.lastName}`)

      // Guardar la fecha de expiración del token
      const expirationTime = new Date().getTime() + (response.data.expiresIn || 86400000)
      localStorage.setItem("tokenExpiration", expirationTime.toString())

      // Configurar un temporizador para cerrar sesión automáticamente cuando expire el token
      setupAutoLogout(response.data.expiresIn || 86400000)
    }

    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = (): void => {
  localStorage.removeItem("token")
  localStorage.removeItem("teacherId")
  localStorage.removeItem("teacherName")
  localStorage.removeItem("tokenExpiration")

  // Limpiar cualquier temporizador de cierre de sesión automático
  if (window.autoLogoutTimer) {
    clearTimeout(window.autoLogoutTimer)
  }
}

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token")

  // Durante la transición, permitir autenticación incluso sin token JWT
  if (!token) {
    const teacherId = localStorage.getItem("teacherId")
    return !!teacherId
  }

  const expiration = localStorage.getItem("tokenExpiration")

  if (!expiration) {
    return true // Durante la transición, si hay token pero no hay expiración, consideramos autenticado
  }

  // Verificar si el token ha expirado
  const expirationTime = Number.parseInt(expiration, 10)
  const currentTime = new Date().getTime()

  if (currentTime > expirationTime) {
    // El token ha expirado, limpiar el almacenamiento
    logout()
    return false
  }

  return true
}

export const getTeacherId = (): number | null => {
  // Durante la transición, no requerir autenticación completa para obtener el ID
  const id = localStorage.getItem("teacherId")
  return id ? Number.parseInt(id, 10) : null
}

export const getTeacherName = (): string | null => {
  // Durante la transición, no requerir autenticación completa para obtener el nombre
  return localStorage.getItem("teacherName")
}

export const getToken = (): string | null => {
  return localStorage.getItem("token")
}

export const getRemainingSessionTime = (): number => {
  const expiration = localStorage.getItem("tokenExpiration")

  if (!expiration) {
    return 0
  }

  const expirationTime = Number.parseInt(expiration, 10)
  const currentTime = new Date().getTime()

  return Math.max(0, expirationTime - currentTime)
}

// Función para configurar el cierre de sesión automático
const setupAutoLogout = (expirationTime: number): void => {
  // Añadir un margen de seguridad de 10 segundos
  const logoutTime = expirationTime - 10000

  // Limpiar cualquier temporizador existente
  if (window.autoLogoutTimer) {
    clearTimeout(window.autoLogoutTimer)
  }

  // Configurar un nuevo temporizador
  window.autoLogoutTimer = setTimeout(() => {
    console.log("Token expired, logging out automatically")
    logout()
    // Redirigir a la página de login
    window.location.href = "/login"
  }, logoutTime)
}

// Declarar la propiedad autoLogoutTimer en el objeto window
declare global {
  interface Window {
    autoLogoutTimer: ReturnType<typeof setTimeout> | undefined
  }
}
