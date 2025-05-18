"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import {
  createAttendanceSession,
  getAttendanceSessionById,
  updateAttendanceSession,
} from "../services/attendanceSessionService"
import { getClassroomById } from "../services/classroomService"
import type { AttendanceSession, Classroom } from "../types"
import "./AttendanceSessionForm.css"

const AttendanceSessionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const classroomIdParam = queryParams.get("classroomId")

  const isEditMode = !!id
  const sessionId = id ? Number.parseInt(id, 10) : 0
  const classroomId = classroomIdParam ? Number.parseInt(classroomIdParam, 10) : 0

  // Validar que el ID sea un número válido en modo edición
  useEffect(() => {
    if (isEditMode && (isNaN(sessionId) || sessionId <= 0)) {
      toast.error("ID de sesión inválido")
      navigate("/attendance-sessions")
    }
  }, [isEditMode, sessionId, navigate])

  const [formData, setFormData] = useState<AttendanceSession>({
    date: new Date().toISOString().split("T")[0],
    startTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    endTime: "",
    topic: "",
    notes: "",
    classroom: { id: classroomId || 0 },
  })

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditMode && sessionId > 0) {
      fetchSessionData()
    } else if (classroomId > 0) {
      fetchClassroomData(classroomId)
    }
  }, [isEditMode, sessionId, classroomId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const sessionData = await getAttendanceSessionById(sessionId)

      // Format date and times for form inputs
      const formattedData = {
        ...sessionData,
        date: new Date(sessionData.date).toISOString().split("T")[0],
        startTime: sessionData.startTime.substring(0, 5),
        endTime: sessionData.endTime ? sessionData.endTime.substring(0, 5) : "",
      }

      setFormData(formattedData)

      if ((sessionData.classroom as any).id) {
        fetchClassroomData((sessionData.classroom as any).id)
      }

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos de la sesión")
      setLoading(false)
      console.error("Error fetching session:", err)
    }
  }

  const fetchClassroomData = async (classroomId: number) => {
    if (isNaN(classroomId) || classroomId <= 0) {
      setError("ID de salón inválido")
      return
    }

    try {
      const classroomData = await getClassroomById(classroomId)
      setClassroom(classroomData)
    } catch (err) {
      console.error("Error fetching classroom:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.date || !formData.startTime || !(formData.classroom as any).id) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        if (isNaN(sessionId) || sessionId <= 0) {
          toast.error("ID de sesión inválido")
          setLoading(false)
          return
        }
        await updateAttendanceSession(sessionId, formData)
        toast.success("Sesión actualizada correctamente")
      } else {
        const classroomId = (formData.classroom as any).id
        if (isNaN(classroomId) || classroomId <= 0) {
          toast.error("ID de salón inválido")
          setLoading(false)
          return
        }
        await createAttendanceSession(classroomId, formData)
        toast.success("Sesión creada correctamente")
      }

      // Redirect to classroom detail or sessions list
      if (classroomId > 0) {
        navigate(`/classrooms/${classroomId}`)
      } else {
        navigate("/attendance-sessions")
      }
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} la sesión`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} la sesión`)
      setLoading(false)
      console.error("Error saving session:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos...</div>
  }

  return (
    <div className="attendance-session-form">
      <h1>{isEditMode ? "Editar Sesión" : "Nueva Sesión"}</h1>

      {classroom && (
        <div className="classroom-info">
          <h2>{classroom.name}</h2>
          <p>{classroom.courseCode}</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Hora de Inicio</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">Hora de Fin</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="topic">Tema</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic || ""}
            onChange={handleChange}
            className="form-control"
            placeholder="Tema de la clase"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            className="form-control"
            rows={3}
            placeholder="Notas adicionales sobre la sesión"
          ></textarea>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (classroomId > 0) {
                navigate(`/classrooms/${classroomId}`)
              } else {
                navigate("/attendance-sessions")
              }
            }}
          >
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

export default AttendanceSessionForm

