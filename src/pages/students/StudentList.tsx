<<<<<<< HEAD
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getStudents } from "../../services/studentService"
import { exportStudentsToExcel } from "../../services/exportService"
import ExportButton from "../../components/ExportButton"
import { useNotification } from "../../context/NotificationContext"
import "./StudentList.css"

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active") // Cambiar default a "active"
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents()
        setStudents(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching students:", error)
        addNotification("error", "Error al cargar los estudiantes")
        setLoading(false)
      }
    }

    fetchStudents()
  }, [addNotification])

  // Filtrar estudiantes basado en búsqueda y estado
  useEffect(() => {
    let filtered = students

    // Filtrar por estado (OCULTAR INACTIVOS POR DEFECTO)
    if (filterStatus === "active") {
      filtered = filtered.filter((student) => student.active === true)
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((student) => student.active === false)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, filterStatus])

  const handleExport = () => {
    if (filteredStudents.length > 0) {
      const success = exportStudentsToExcel(filteredStudents, "Lista_Estudiantes")
      if (success) {
        addNotification("success", "Estudiantes exportados exitosamente")
      } else {
        addNotification("error", "Error al exportar estudiantes")
      }
    } else {
      addNotification("warning", "No hay estudiantes para exportar")
    }
  }

  const getActiveCount = () => students.filter((s) => s.active === true).length
  const getInactiveCount = () => students.filter((s) => s.active === false).length

  if (loading) {
    return <div className="loading">Cargando estudiantes...</div>
  }

  return (
    <div className="student-list-container">
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">Lista de Estudiantes</h1>
          <p className="page-subtitle">Gestiona los estudiantes del sistema</p>
        </div>
        <div className="header-actions">
          <ExportButton onClick={handleExport} disabled={loading || filteredStudents.length === 0} />
          <Link to="/students/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Nuevo Estudiante
          </Link>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* ESTADÍSTICAS Y FILTROS - SIN MOSTRAR ESTADO INACTIVO PROMINENTEMENTE */}
        <div className="stats-container">
          <div className="stat-item active" onClick={() => setFilterStatus("active")}>
            <div className="stat-number">{getActiveCount()}</div>
            <div className="stat-label">Estudiantes</div>
          </div>
          <div className="stat-item total" onClick={() => setFilterStatus("all")}>
            <div className="stat-number">{students.length}</div>
            <div className="stat-label">Total</div>
          </div>
          {/* OCULTAR O MINIMIZAR EL CONTADOR DE INACTIVOS */}
          {getInactiveCount() > 0 && (
            <div className="stat-item inactive small" onClick={() => setFilterStatus("inactive")}>
              <div className="stat-number">{getInactiveCount()}</div>
              <div className="stat-label">Archivados</div>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE ESTUDIANTES */}
      {filteredStudents.length === 0 ? (
        <div className="no-students">
          {searchTerm ? (
            <>
              <i className="fas fa-search"></i>
              <h3>No se encontraron estudiantes</h3>
              <p>No hay estudiantes que coincidan con "{searchTerm}"</p>
              <button className="btn btn-secondary" onClick={() => setSearchTerm("")}>
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <i className="fas fa-user-graduate"></i>
              <h3>No hay estudiantes</h3>
              <p>Comienza agregando tu primer estudiante</p>
              <Link to="/students/new" className="btn btn-primary">
                <i className="fas fa-plus"></i> Agregar Estudiante
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              {/* NO MOSTRAR BADGE DE ESTADO PROMINENTEMENTE */}
              <div className="student-header">
                <div className="student-avatar">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="student-basic-info">
                  <h3 className="student-name">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="student-id">ID: {student.studentId}</p>
                </div>
                {/* INDICADOR SUTIL DE ESTADO - SOLO SI ES INACTIVO */}
                {!student.active && <div className="status-indicator inactive" title="Estudiante archivado"></div>}
              </div>

              <div className="student-details">
                <div className="detail-item">
                  <i className="fas fa-envelope"></i>
                  <span>{student.email}</span>
                </div>
                {student.phone && (
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.grade && (
                  <div className="detail-item">
                    <i className="fas fa-graduation-cap"></i>
                    <span>
                      Grado {student.grade}
                      {student.section && ` - Sección ${student.section}`}
                    </span>
                  </div>
                )}
                {student.enrollmentDate && (
                  <div className="detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Inscrito: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="student-actions">
                <Link to={`/students/${student.id}`} className="btn-action view" title="Ver detalles">
                  <i className="fas fa-eye"></i>
                </Link>
                <Link to={`/students/edit/${student.id}`} className="btn-action edit" title="Editar">
                  <i className="fas fa-edit"></i>
                </Link>
                <button
                  className="btn-action delete"
                  title={student.active ? "Archivar" : "Eliminar"}
                  onClick={() => {
                    // Implementar lógica de archivar/eliminar
                    addNotification("info", "Funcionalidad en desarrollo")
                  }}
                >
                  <i className={student.active ? "fas fa-archive" : "fas fa-trash"}></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INFORMACIÓN ADICIONAL */}
      {filteredStudents.length > 0 && (
        <div className="results-info">
          <p>
            Mostrando {filteredStudents.length} de {students.length} estudiantes
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  )
}

export default StudentList
=======
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



>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1
