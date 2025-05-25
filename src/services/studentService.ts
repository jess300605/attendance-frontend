import api from "./api"
import type { Student } from "../types"

const BASE_PATH = "/students"

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>(BASE_PATH)
  return response.data
}

export const getStudentById = async (id: number): Promise<Student> => {
  const response = await api.get<Student>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getStudentByStudentId = async (studentId: string): Promise<Student> => {
  const response = await api.get<Student>(`${BASE_PATH}/studentId/${studentId}`)
  return response.data
}

export const createStudent = async (student: Student): Promise<Student> => {
  const response = await api.post<Student>(BASE_PATH, student)
  return response.data
}

export const updateStudent = async (id: number, student: Student): Promise<Student> => {
  const response = await api.put<Student>(`${BASE_PATH}/${id}`, student)
  return response.data
}

export const deleteStudent = async (id: number): Promise<void> => {
  await api.delete(`${BASE_PATH}/${id}`)
}

