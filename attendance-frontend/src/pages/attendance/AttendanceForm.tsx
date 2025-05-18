"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { getAttendanceById, createAttendance, updateAttendance } from "../../services/attendanceService"
import { getStudents } from "../../services/studentService"
import { getTeachers } from "../../services/teacherService"
import type { Attendance, Student, Teacher } from "../../types"
import "./AttendanceForm.css"

const AttendanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const studentIdParam = queryParams.get("studentId")
  const teacherIdParam = queryParams.get("teacherId")

  const isEditMode = !!id

  const [formData, setFormData] = useState<Attendance>({
    present: true,
    timeIn: new Date().toTimeString().split(" ")[0].substring(0, 5),
    timeOut: "",
    notes: "",
    type: "STUDENT",
    student: { id: studentIdParam ? Number.parseInt(studentIdParam) : 0 },
    teacher: { id: teacherIdParam ? Number.parseInt(teacherIdParam) : 0 },
  })

  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch students and teachers
      const [studentsData, teachersData] = await Promise.all([getStudents(), getTeachers()])

      setStudents(studentsData)
      setTeachers(teachersData)

      // If editing, fetch attendance record
      if (isEditMode) {
        const attendanceData = await getAttendanceById(Number.parseInt(id as string))

        // Format times for form inputs
        const formattedData = {
          ...attendanceData,
          timeIn: attendanceData.timeIn ? attendanceData.timeIn.substring(0, 5) : "",
          timeOut: attendanceData.timeOut ? attendanceData.timeOut.substring(0, 5) : "",
        }

        setFormData(formattedData)

        // If this attendance is part of a session, get the date from the session
        if (attendanceData.attendanceSession && (attendanceData.attendanceSession as any).date) {
          setSessionDate((attendanceData.attendanceSession as any).date)
        }
      }

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos")
      setLoading(false)
      console.error("Error fetching data:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else if (name === "type") {
      // Asegurarse de que value es "STUDENT" o "TEACHER"
      const attendanceType = value === "STUDENT" ? "STUDENT" : "TEACHER"

      // Reset the corresponding entity when type changes
      setFormData((prev) => ({
        ...prev,
        type: attendanceType as "STUDENT" | "TEACHER",
        student: attendanceType === "STUDENT" ? { id: 0 } : undefined,
        teacher: attendanceType === "TEACHER" ? { id: 0 } : undefined,
      }))
    } else if (name === "studentId") {
      setFormData((prev) => ({
        ...prev,
        student: { id: Number.parseInt(value) },
      }))
    } else if (name === "teacherId") {
      setFormData((prev) => ({
        ...prev,
        teacher: { id: Number.parseInt(value) },
      }))
    } else if (name === "date") {
      setSessionDate(value)
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
    if (!sessionDate || !formData.timeIn) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    if (formData.type === "STUDENT" && (!formData.student || (formData.student as any).id === 0)) {
      toast.error("Por favor selecciona un estudiante")
      return
    }

    if (formData.type === "TEACHER" && (!formData.teacher || (formData.teacher as any).id === 0)) {
      toast.error("Por favor selecciona un profesor")
      return
    }

    try {
      setLoading(true)

      // We'll pass the date to the service, but it's not part of the Attendance type
      // The backend will handle associating it with the correct AttendanceSession
      const dataToSubmit = {
        ...formData,
        // We don't include date here as it's not part of the Attendance type
      }

      if (isEditMode) {
        await updateAttendance(Number.parseInt(id as string), dataToSubmit)
        toast.success("Registro de asistencia actualizado correctamente")
      } else {
        await createAttendance(dataToSubmit)
        toast.success("Registro de asistencia creado correctamente")
      }

      navigate("/attendance")
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} el registro de asistencia`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} el registro de asistencia`)
      setLoading(false)
      console.error("Error saving attendance:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos...</div>
  }

  return (
    <div className="attendance-form">
      <h1>{isEditMode ? "Editar Registro de Asistencia" : "Nuevo Registro de Asistencia"}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} className="form-control" required>
            <option value="STUDENT">Estudiante</option>
            <option value="TEACHER">Profesor</option>
          </select>
        </div>

        {formData.type === "STUDENT" && (
          <div className="form-group">
            <label htmlFor="studentId">Estudiante</label>
            <select
              id="studentId"
              name="studentId"
              value={(formData.student as any)?.id || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Selecciona un estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.studentId})
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.type === "TEACHER" && (
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
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={sessionDate}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="present">¿Presente?</label>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="present"
                name="present"
                checked={formData.present}
                onChange={handleChange}
                className="form-checkbox"
              />
              <label htmlFor="present" className="checkbox-label">
                {formData.present ? "Sí" : "No"}
              </label>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeIn">Hora de Entrada</label>
            <input
              type="time"
              id="timeIn"
              name="timeIn"
              value={formData.timeIn || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeOut">Hora de Salida</label>
            <input
              type="time"
              id="timeOut"
              name="timeOut"
              value={formData.timeOut || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
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
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/attendance")}>
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

export default AttendanceForm



