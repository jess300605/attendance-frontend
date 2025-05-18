import api from "./api"
import type { Teacher } from "../types"

const BASE_PATH = "/teachers"

export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get<Teacher[]>(BASE_PATH)
  return response.data
}

export const getTeacherById = async (id: number): Promise<Teacher> => {
  const response = await api.get<Teacher>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getTeacherByEmployeeId = async (employeeId: string): Promise<Teacher> => {
  const response = await api.get<Teacher>(`${BASE_PATH}/employeeId/${employeeId}`)
  return response.data
}

export const createTeacher = async (teacher: Teacher): Promise<Teacher> => {
  const response = await api.post<Teacher>(BASE_PATH, teacher)
  return response.data
}

export const updateTeacher = async (id: number, teacher: Teacher): Promise<Teacher> => {
  const response = await api.put<Teacher>(`${BASE_PATH}/${id}`, teacher)
  return response.data
}

export const deleteTeacher = async (id: number): Promise<void> => {
  await api.delete(`${BASE_PATH}/${id}`)
}

