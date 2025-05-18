"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { getGrades, deleteGrade } from "../services/gradeService"
import type { Grade } from "../types"
import "./GradeList.css"

const GradeList: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterEvaluationType, setFilterEvaluationType] = useState<string>("")
  const [evaluationTypes, setEvaluationTypes] = useState<string[]>([])

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const data = await getGrades()
      setGrades(data)

      // Extract unique evaluation types for filter
      const uniqueTypes = Array.from(
        new Set(data.map((grade) => grade.evaluationType).filter((type): type is string => type !== undefined)),
      )
      setEvaluationTypes(uniqueTypes)

      setLoading(false)
    } catch (err) {
      setError("Error al cargar las calificaciones")
      setLoading(false)
      console.error("Error fetching grades:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta calificación?")) {
      try {
        await deleteGrade(id)
        setGrades(grades.filter((grade) => grade.id !== id))
        toast.success("Calificación eliminada correctamente")
      } catch (err) {
        toast.error("Error al eliminar la calificación")
        console.error("Error deleting grade:", err)
      }
    }
  }

  const filteredGrades = grades.filter((grade) => {
    // Filter by evaluation type
    if (filterEvaluationType && grade.evaluationType !== filterEvaluationType) {
      return false
    }

    // Filter by search term (student name, classroom name, or comments)
    if (searchTerm) {
      const studentName = (grade.student as any).firstName
        ? `${(grade.student as any).firstName} ${(grade.student as any).lastName}`.toLowerCase()
        : ""
      const classroomName = (grade.classroom as any).name ? (grade.classroom as any).name.toLowerCase() : ""
      const comments = grade.comments?.toLowerCase() || ""

      return (
        studentName.includes(searchTerm.toLowerCase()) ||
        classroomName.includes(searchTerm.toLowerCase()) ||
        comments.includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  if (loading) {
    return <div className="loading">Cargando calificaciones...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="grade-list">
      <div className="list-header">
        <h1>Calificaciones</h1>
        <Link to="/grades/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nueva Calificación
        </Link>
      </div>

      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por estudiante, salón o comentarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label>Tipo de Evaluación:</label>
            <select
              value={filterEvaluationType}
              onChange={(e) => setFilterEvaluationType(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              {evaluationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredGrades.length === 0 ? (
        <div className="no-data">
          {searchTerm || filterEvaluationType
            ? "No se encontraron calificaciones con los filtros aplicados"
            : "No hay calificaciones registradas"}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Salón</th>
                <th>Tipo de Evaluación</th>
                <th>Calificación</th>
                <th>Fecha</th>
                <th>Comentarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td>
                    {(grade.student as any).firstName
                      ? `${(grade.student as any).firstName} ${(grade.student as any).lastName}`
                      : "Estudiante"}
                  </td>
                  <td>
                    {(grade.classroom as any).name
                      ? `${(grade.classroom as any).name} (${(grade.classroom as any).courseCode})`
                      : "Salón"}
                  </td>
                  <td>{grade.evaluationType}</td>
                  <td className="grade-score">{grade.score}</td>
                  <td>{new Date(grade.date).toLocaleDateString()}</td>
                  <td>{grade.comments || "-"}</td>
                  <td className="actions">
                    <Link to={`/grades/edit/${grade.id}`} className="btn-action edit">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn-action delete" onClick={() => grade.id && handleDelete(grade.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GradeList

