"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { getStudents, deleteStudent } from "../../services/studentService"
import type { Student } from "../../types"
import "./StudentList.css"

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await getStudents()
      setStudents(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los estudiantes")
      setLoading(false)
      console.error("Error fetching students:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
      try {
        await deleteStudent(id)
        setStudents(students.filter((student) => student.id !== id))
        toast.success("Estudiante eliminado correctamente")
      } catch (err) {
        toast.error("Error al eliminar el estudiante")
        console.error("Error deleting student:", err)
      }
    }
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return <div className="loading">Cargando estudiantes...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="student-list-container">
      <div className="student-list-header">
        <h1>Estudiantes</h1>
        <Link to="/students/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nuevo Estudiante
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="no-data">
          {searchTerm ? "No se encontraron estudiantes con esa búsqueda" : "No hay estudiantes registrados"}
        </div>
      ) : (
        <div className="student-table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>ID Estudiante</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.studentId}</td>
                  <td>{student.email}</td>
                  <td className="actions">
                    <Link to={`/students/${student.id}`} className="btn-action view" title="Ver detalles">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/students/edit/${student.id}`} className="btn-action edit" title="Editar">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="btn-action delete"
                      onClick={() => student.id && handleDelete(student.id)}
                      title="Eliminar"
                    >
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

export default StudentList



