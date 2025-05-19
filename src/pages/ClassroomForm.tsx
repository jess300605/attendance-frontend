"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getClassroomById, createClassroom, updateClassroom } from "../services/classroomService"
import { getTeachers } from "../services/teacherService"
import type { Classroom, Teacher } from "../types"
import "./ClassroomForm.css"

const ClassroomForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<Classroom>({
    name: "",
    courseCode: "",
    description: "",
    teacher: { id: 0 },
  })

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeachers()
    if (isEditMode) {
      fetchClassroom()
    }
  }, [id])

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers()
      setTeachers(data)
    } catch (err) {
      console.error("Error fetching teachers:", err)
      setError("Error al cargar los profesores")
    }
  }

  const fetchClassroom = async () => {
    try {
      setLoading(true)
      const data = await getClassroomById(Number.parseInt(id as string))
      setFormData(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del salón")
      setLoading(false)
      console.error("Error fetching classroom:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "teacherId") {
      setFormData((prev) => ({
        ...prev,
        teacher: { id: Number.parseInt(value) },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.courseCode || !(formData.teacher as any).id) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await updateClassroom(Number.parseInt(id as string), formData)
        toast.success("Salón actualizado correctamente")
      } else {
        await createClassroom(formData)
        toast.success("Salón creado correctamente")
      }

      navigate("/dashboard")
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} el salón`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} el salón`)
      setLoading(false)
      console.error("Error saving classroom:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos del salón...</div>
  }

  return (
    <div className="classroom-form">
      <h1>{isEditMode ? "Editar Salón" : "Nuevo Salón"}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre del Salón</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: Matemáticas 101"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Código del Curso</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: MAT101"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="form-control"
            rows={3}
            placeholder="Descripción del curso"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="teacherId">Profesor</label>
          <select
            id="teacherId"
            name="teacherId"
            value={(formData.teacher as any)?.id || ""}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Selecciona un profesor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClassroomForm

