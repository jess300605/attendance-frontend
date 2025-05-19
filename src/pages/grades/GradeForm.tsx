"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { getGradeById, createGrade, updateGrade, createGrades } from "../../services/gradeService"
import { getClassroomById } from "../../services/classroomService"
import type { Grade, Classroom } from "../../types"
import "./GradeForm.css"

const GradeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const classroomIdParam = queryParams.get("classroomId")
  const studentIdParam = queryParams.get("studentId")

  const isEditMode = !!id
  const isBatchMode = !isEditMode && !studentIdParam

  const [formData, setFormData] = useState<Grade>({
    student: { id: studentIdParam ? Number.parseInt(studentIdParam) : 0 },
    classroom: { id: classroomIdParam ? Number.parseInt(classroomIdParam) : 0 },
    evaluationType: "",
    score: 0,
    date: new Date().toISOString().split("T")[0],
    comments: "",
  })

  const [batchGrades, setBatchGrades] = useState<Grade[]>([])
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditMode) {
      fetchGradeData()
    } else if (classroomIdParam) {
      fetchClassroomData(Number.parseInt(classroomIdParam))
    }
  }, [id, classroomIdParam])

  const fetchGradeData = async () => {
    try {
      setLoading(true)
      const gradeData = await getGradeById(Number.parseInt(id as string))

      // Format date for form input
      const formattedData = {
        ...gradeData,
        date: new Date(gradeData.date).toISOString().split("T")[0],
      }

      setFormData(formattedData)

      if ((gradeData.classroom as any).id) {
        fetchClassroomData((gradeData.classroom as any).id)
      }

      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos de la calificación")
      setLoading(false)
      console.error("Error fetching grade:", err)
    }
  }

  const fetchClassroomData = async (classroomId: number) => {
    try {
      const classroomData = await getClassroomById(classroomId)
      setClassroom(classroomData)

      // Initialize batch grades for all students in the classroom
      if (isBatchMode && classroomData.students && classroomData.students.length > 0) {
        const grades = classroomData.students
          .filter((student) => student.id !== undefined) // Filtramos estudiantes sin id
          .map((student) => ({
            student: { id: student.id as number }, // Aseguramos que id es number
            classroom: { id: classroomData.id as number }, // Aseguramos que id es number
            evaluationType: "",
            score: 0,
            date: new Date().toISOString().split("T")[0],
            comments: "",
          }))

        setBatchGrades(grades)
      }
    } catch (err) {
      console.error("Error fetching classroom:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "score") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number.parseFloat(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target

    setBatchGrades((prevGrades) =>
      prevGrades.map((grade, i) => {
        if (i === index) {
          if (name === "score") {
            return { ...grade, [name]: Number.parseFloat(value) }
          } else {
            return { ...grade, [name]: value }
          }
        }
        return grade
      }),
    )
  }

  const handleBatchCommonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target

    // Update all batch grades with common fields
    setBatchGrades((prevGrades) =>
      prevGrades.map((grade) => {
        if (name === "evaluationType" || name === "date") {
          return { ...grade, [name]: value }
        }
        return grade
      }),
    )

    // Also update the form data for consistency
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      if (isBatchMode) {
        // Validate batch grades
        if (!formData.evaluationType || !formData.date) {
          toast.error("Por favor completa los campos requeridos")
          setLoading(false)
          return
        }

        // Update common fields in all batch grades
        const updatedBatchGrades = batchGrades.map((grade) => ({
          ...grade,
          evaluationType: formData.evaluationType,
          date: formData.date,
        }))

        await createGrades(updatedBatchGrades)
        toast.success("Calificaciones creadas correctamente")
      } else if (isEditMode) {
        // Validate single grade
        if (!formData.evaluationType || !formData.date || formData.score < 0) {
          toast.error("Por favor completa los campos requeridos correctamente")
          setLoading(false)
          return
        }

        await updateGrade(Number.parseInt(id as string), formData)
        toast.success("Calificación actualizada correctamente")
      } else {
        // Validate single grade
        if (!formData.evaluationType || !formData.date || formData.score < 0 || !(formData.student as any).id) {
          toast.error("Por favor completa los campos requeridos correctamente")
          setLoading(false)
          return
        }

        await createGrade(formData)
        toast.success("Calificación creada correctamente")
      }

      // Redirect to classroom detail or grades list
      if (classroomIdParam) {
        navigate(`/classrooms/${classroomIdParam}`)
      } else {
        navigate("/grades")
      }
    } catch (err) {
      setError(`Error al ${isEditMode ? "actualizar" : "crear"} la calificación`)
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} la calificación`)
      setLoading(false)
      console.error("Error saving grade:", err)
    }
  }

  if (loading && isEditMode) {
    return <div className="loading">Cargando datos...</div>
  }

  return (
    <div className="grade-form">
      <h1>{isEditMode ? "Editar Calificación" : isBatchMode ? "Calificaciones en Lote" : "Nueva Calificación"}</h1>

      {classroom && (
        <div className="classroom-info">
          <h2>{classroom.name}</h2>
          <p>{classroom.courseCode}</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Common fields for both single and batch modes */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="evaluationType">Tipo de Evaluación</label>
            <input
              type="text"
              id="evaluationType"
              name="evaluationType"
              value={formData.evaluationType}
              onChange={isBatchMode ? handleBatchCommonChange : handleChange}
              className="form-control"
              placeholder="Examen, Tarea, Proyecto, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={isBatchMode ? handleBatchCommonChange : handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        {/* Single grade mode */}
        {!isBatchMode && (
          <>
            {!isEditMode && classroom && classroom.students && (
              <div className="form-group">
                <label htmlFor="studentId">Estudiante</label>
                <select
                  id="studentId"
                  name="studentId"
                  value={(formData.student as any)?.id || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      student: { id: Number.parseInt(e.target.value) },
                    }))
                  }}
                  className="form-control"
                  required
                  disabled={isEditMode || !!studentIdParam}
                >
                  <option value="">Selecciona un estudiante</option>
                  {classroom.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="score">Calificación</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleChange}
                className="form-control"
                min="0"
                max="10"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comentarios</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments || ""}
                onChange={handleChange}
                className="form-control"
                rows={3}
                placeholder="Comentarios sobre la calificación"
              ></textarea>
            </div>
          </>
        )}

        {/* Batch grade mode */}
        {isBatchMode && classroom && classroom.students && (
          <div className="batch-grades">
            <h3>Calificaciones por Estudiante</h3>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Calificación</th>
                    <th>Comentarios</th>
                  </tr>
                </thead>
                <tbody>
                  {batchGrades.map((grade, index) => {
                    const student = classroom.students?.find((s) => s.id === (grade.student as any).id)

                    return (
                      <tr key={index}>
                        <td>
                          {student ? `${student.firstName} ${student.lastName} (${student.studentId})` : "Estudiante"}
                        </td>
                        <td>
                          <input
                            type="number"
                            name="score"
                            value={grade.score}
                            onChange={(e) => handleBatchChange(e, index)}
                            className="form-control"
                            min="0"
                            max="10"
                            step="0.1"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="comments"
                            value={grade.comments || ""}
                            onChange={(e) => handleBatchChange(e, index)}
                            className="form-control"
                            placeholder="Comentarios"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (classroomIdParam) {
                navigate(`/classrooms/${classroomIdParam}`)
              } else {
                navigate("/grades")
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

export default GradeForm

