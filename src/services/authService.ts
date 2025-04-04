import api from "./api"
import type { TeacherLogin, TeacherLoginResponse } from "../types"

export const login = async (credentials: TeacherLogin): Promise<TeacherLoginResponse> => {
  try {
    console.log("Sending login request:", credentials)
    const response = await api.post<TeacherLoginResponse>("/auth/login", credentials)
    console.log("Login response:", response.data)

    // Guardar el token en localStorage
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("teacherId", response.data.id.toString())
      localStorage.setItem("teacherName", `${response.data.firstName} ${response.data.lastName}`)
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
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token")
}

export const getTeacherId = (): number | null => {
  const id = localStorage.getItem("teacherId")
  return id ? Number.parseInt(id, 10) : null
}

export const getTeacherName = (): string | null => {
  return localStorage.getItem("teacherName")
}

