import api from "./api"
import type { AttendanceSession, Attendance } from "../types"

const BASE_PATH = "/attendance-sessions"

export const getAttendanceSessions = async (): Promise<AttendanceSession[]> => {
  const response = await api.get<AttendanceSession[]>(BASE_PATH)
  return response.data
}

export const getAttendanceSessionById = async (id: number): Promise<AttendanceSession> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de sesión inválido")
  }
  const response = await api.get<AttendanceSession>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getAttendanceSessionsByClassroom = async (classroomId: number): Promise<AttendanceSession[]> => {
  if (isNaN(classroomId) || classroomId <= 0) {
    throw new Error("ID de salón inválido")
  }
  const response = await api.get<AttendanceSession[]>(`${BASE_PATH}/classroom/${classroomId}`)
  return response.data
}

export const getAttendanceSessionByClassroomAndDate = async (
  classroomId: number,
  date: string,
): Promise<AttendanceSession> => {
  if (isNaN(classroomId) || classroomId <= 0) {
    throw new Error("ID de salón inválido")
  }
  const response = await api.get<AttendanceSession>(`${BASE_PATH}/classroom/${classroomId}/date/${date}`)
  return response.data
}

export const createAttendanceSession = async (
  classroomId: number,
  session: AttendanceSession,
): Promise<AttendanceSession> => {
  if (isNaN(classroomId) || classroomId <= 0) {
    throw new Error("ID de salón inválido")
  }
  const response = await api.post<AttendanceSession>(`${BASE_PATH}/classroom/${classroomId}`, session)
  return response.data
}

export const takeAttendanceForSession = async (
  sessionId: number,
  attendanceRecords: Attendance[],
): Promise<Attendance[]> => {
  if (isNaN(sessionId) || sessionId <= 0) {
    throw new Error("ID de sesión inválido")
  }
  const response = await api.post<Attendance[]>(`${BASE_PATH}/${sessionId}/attendance`, attendanceRecords)
  return response.data
}

export const updateAttendanceSession = async (id: number, session: AttendanceSession): Promise<AttendanceSession> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de sesión inválido")
  }
  const response = await api.put<AttendanceSession>(`${BASE_PATH}/${id}`, session)
  return response.data
}

export const deleteAttendanceSession = async (id: number): Promise<void> => {
  if (isNaN(id) || id <= 0) {
    throw new Error("ID de sesión inválido")
  }
  await api.delete(`${BASE_PATH}/${id}`)
}

