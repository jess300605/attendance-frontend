import api from "./api"
import type { Attendance } from "../types"

const BASE_PATH = "/attendance"

export const getAttendance = async (): Promise<Attendance[]> => {
  const response = await api.get<Attendance[]>(BASE_PATH)
  return response.data
}

export const getAttendanceById = async (id: number): Promise<Attendance> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de asistencia inválido")
  }
  const response = await api.get<Attendance>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getAttendanceByStudent = async (studentId: number): Promise<Attendance[]> => {
  if (isNaN(studentId) || studentId <= 0) {
    throw new Error("ID de estudiante inválido")
  }
  const response = await api.get<Attendance[]>(`${BASE_PATH}/students/${studentId}`)
  return response.data
}

export const getAttendanceByTeacher = async (teacherId: number): Promise<Attendance[]> => {
  if (isNaN(teacherId) || teacherId <= 0) {
    throw new Error("ID de profesor inválido")
  }
  const response = await api.get<Attendance[]>(`${BASE_PATH}/teachers/${teacherId}`)
  return response.data
}

export const getAttendanceByDate = async (date: string): Promise<Attendance[]> => {
  const response = await api.get<Attendance[]>(`${BASE_PATH}/date/${date}`)
  return response.data
}

export const getStudentAttendanceBetweenDates = async (
  studentId: number,
  startDate: string,
  endDate: string,
): Promise<Attendance[]> => {
  if (isNaN(studentId) || studentId <= 0) {
    throw new Error("ID de estudiante inválido")
  }
  const response = await api.get<Attendance[]>(
    `${BASE_PATH}/students/${studentId}/between?startDate=${startDate}&endDate=${endDate}`,
  )
  return response.data
}

export const getTeacherAttendanceBetweenDates = async (
  teacherId: number,
  startDate: string,
  endDate: string,
): Promise<Attendance[]> => {
  if (isNaN(teacherId) || teacherId <= 0) {
    throw new Error("ID de profesor inválido")
  }
  const response = await api.get<Attendance[]>(
    `${BASE_PATH}/teachers/${teacherId}/between?startDate=${startDate}&endDate=${endDate}`,
  )
  return response.data
}

export const createAttendance = async (attendance: Attendance): Promise<Attendance> => {
  // Asegurarse de que el estudiante tenga un ID válido
  if (attendance.type === "STUDENT" && (!attendance.student || !(attendance.student as any).id)) {
    throw new Error("ID de estudiante inválido")
  }

  // Asegurarse de que el profesor tenga un ID válido si es asistencia de profesor
  if (attendance.type === "TEACHER" && (!attendance.teacher || !(attendance.teacher as any).id)) {
    throw new Error("ID de profesor inválido")
  }

  const response = await api.post<Attendance>(BASE_PATH, attendance)
  return response.data
}

export const updateAttendance = async (id: number, attendance: Attendance): Promise<Attendance> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de asistencia inválido")
  }
  const response = await api.put<Attendance>(`${BASE_PATH}/${id}`, attendance)
  return response.data
}

export const deleteAttendance = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de asistencia inválido")
  }
  await api.delete(`${BASE_PATH}/${id}`)
}

