import api from "./api"
import type { Classroom } from "../types"

const BASE_PATH = "/classrooms"

export const getClassrooms = async (): Promise<Classroom[]> => {
  const response = await api.get<Classroom[]>(BASE_PATH)
  return response.data
}

export const getClassroomById = async (id: number): Promise<Classroom> => {
  const response = await api.get<Classroom>(`${BASE_PATH}/${id}`)
  return response.data
}

export const getClassroomsByTeacher = async (teacherId: number): Promise<Classroom[]> => {
  const response = await api.get<Classroom[]>(`${BASE_PATH}/teacher/${teacherId}`)
  return response.data
}

export const createClassroom = async (classroom: Classroom): Promise<Classroom> => {
  const response = await api.post<Classroom>(BASE_PATH, classroom)
  return response.data
}

export const updateClassroom = async (id: number, classroom: Classroom): Promise<Classroom> => {
  const response = await api.put<Classroom>(`${BASE_PATH}/${id}`, classroom)
  return response.data
}

export const deleteClassroom = async (id: number): Promise<void> => {
  await api.delete(`${BASE_PATH}/${id}`)
}

export const addStudentToClassroom = async (classroomId: number, studentId: number): Promise<Classroom> => {
  const response = await api.post<Classroom>(`${BASE_PATH}/${classroomId}/students/${studentId}`)
  return response.data
}

export const removeStudentFromClassroom = async (classroomId: number, studentId: number): Promise<Classroom> => {
  const response = await api.delete<Classroom>(`${BASE_PATH}/${classroomId}/students/${studentId}`)
  return response.data
}

