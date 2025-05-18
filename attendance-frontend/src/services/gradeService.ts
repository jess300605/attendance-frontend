import api from "./api"
import type { Grade } from "../types"

const BASE_PATH = "/grades"

export const getGrades = async (): Promise<Grade[]> => {
  const response = await api.get<Grade[]>(BASE_PATH)
  return response.data
}

export const getGradeById = async (id: number): Promise<Grade> => {
  const response = await api.get<Grade>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getGradesByStudent = async (studentId: number): Promise<Grade[]> => {
  const response = await api.get<Grade[]>(`${BASE_PATH}/students/${studentId}`)
  return response.data
}

export const getGradesByClassroom = async (classroomId: number): Promise<Grade[]> => {
  const response = await api.get<Grade[]>(`${BASE_PATH}/classrooms/${classroomId}`)
  return response.data
}

export const getGradesByStudentAndClassroom = async (studentId: number, classroomId: number): Promise<Grade[]> => {
  const response = await api.get<Grade[]>(`${BASE_PATH}/students/${studentId}/classrooms/${classroomId}`)
  return response.data
}

export const createGrade = async (grade: Grade): Promise<Grade> => {
  const response = await api.post<Grade>(BASE_PATH, grade)
  return response.data
}

export const createGrades = async (grades: Grade[]): Promise<Grade[]> => {
  const response = await api.post<Grade[]>(`${BASE_PATH}/batch`, grades)
  return response.data
}

export const updateGrade = async (id: number, grade: Grade): Promise<Grade> => {
  const response = await api.put<Grade>(`${BASE_PATH}/${id}`, grade)
  return response.data
}

export const deleteGrade = async (id: number): Promise<void> => {
  await api.delete(`${BASE_PATH}/${id}`)
}

