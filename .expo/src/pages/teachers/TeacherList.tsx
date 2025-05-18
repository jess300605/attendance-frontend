"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { getTeachers, deleteTeacher } from "../../services/teacherService"
import type { Teacher } from "../../types"
import "./TeacherList.css"

const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const data = await getTeachers()
      setTeachers(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los profesores")
      setLoading(false)
      console.error("Error fetching teachers:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este profesor?")) {
      try {
        await deleteTeacher(id)
        setTeachers(teachers.filter((teacher) => teacher.id !== id))
        toast.success("Profesor eliminado correctamente")
      } catch (err) {
        toast.error("Error al eliminar el profesor")
        console.error("Error deleting teacher:", err)
      }
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return <div className="loading">Cargando profesores...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="teacher-list">
      <div className="list-header">
        <h1>Profesores</h1>
        <Link to="/teachers/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nuevo Profesor
        </Link>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar profesores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="no-data">
          {searchTerm ? "No se encontraron profesores con esa búsqueda" : "No hay profesores registrados"}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>ID Empleado</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.id}</td>
                  <td>{teacher.firstName}</td>
                  <td>{teacher.lastName}</td>
                  <td>{teacher.employeeId}</td>
                  <td>{teacher.email}</td>
                  <td className="actions">
                    <Link to={`/teachers/${teacher.id}`} className="btn-action view">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/teachers/edit/${teacher.id}`} className="btn-action edit">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn-action delete" onClick={() => teacher.id && handleDelete(teacher.id)}>
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

export default TeacherList

