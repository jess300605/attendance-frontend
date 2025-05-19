"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getTeacherById, createTeacher, updateTeacher } from "../../services/teacherService"
import type { Teacher } from "../../types"
import "./TeacherForm.css"

const TeacherForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState<Teacher>({
    firstName: "",
    lastName: "",
    employeeId: "",
    email: "",
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditMode) {
      fetchTeacher()
    }
  }, [id])

  const fetchTeacher = async () => {
    try {
      setLoading(true)
      const data = await getTeacherById(Number.parseInt(id as string))
      setFormData(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos del profesor")
      setLoading(false)
      console.error("Error fetching teacher:", err)
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
    if (!formData.firstName || !formData.lastName || !formData.employeeId || !formData.email) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await updateTeacher(Number.parseInt(id as string), formData)
        toast.success("Profesor actualizado correctamente")
      } else {
        await createTeacher(formData)
        toast.success("Profesor creado correctamente")
      }

      navigate("/teachers")
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} el profesor`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} el profesor`)
      setLoading(false)
      console.error("Error saving teacher:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos del profesor...</div>
  }

  return (
    <div className="teacher-form">
      <h1>{isEditMode ? "Editar Profesor" : "Nuevo Profesor"}</h1>

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
          <label htmlFor="employeeId">ID Empleado</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/teachers")}>
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

export default TeacherForm

