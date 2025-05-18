"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getStudentById, createStudent, updateStudent } from "../../services/studentService"
import type { Student } from "../../types"
import "./StudentForm.css"

const StudentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<Student>({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditMode) {
      fetchStudent()
    }
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const data = await getStudentById(Number.parseInt(id as string))
      setFormData(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del estudiante")
      setLoading(false)
      console.error("Error fetching student:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.studentId || !formData.email) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await updateStudent(Number.parseInt(id as string), formData)
        toast.success("Estudiante actualizado correctamente")
      } else {
        await createStudent(formData)
        toast.success("Estudiante creado correctamente")
      }

      navigate("/students")
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} el estudiante`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} el estudiante`)
      setLoading(false)
      console.error("Error saving student:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos del estudiante...</div>
  }

  return (
    <div className="student-form">
      <h1>{isEditMode ? "Editar Estudiante" : "Nuevo Estudiante"}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">Nombre</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentId">ID Estudiante</label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/students")}>
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

export default StudentForm

