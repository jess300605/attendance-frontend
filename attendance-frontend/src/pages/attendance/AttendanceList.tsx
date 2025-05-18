"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { getAttendanceSessions, deleteAttendanceSession } from "../../services/attendanceSessionService"
import type { AttendanceSession } from "../../types"
import "./AttendanceSessionList.css"

const AttendanceSessionList: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterDate, setFilterDate] = useState<string>("")

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await getAttendanceSessions()
      setSessions(data)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar las sesiones de asistencia")
      setLoading(false)
      console.error("Error fetching sessions:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sesión de asistencia?")) {
      try {
        await deleteAttendanceSession(id)
        setSessions(sessions.filter((session) => session.id !== id))
        toast.success("Sesión de asistencia eliminada correctamente")
      } catch (err) {
        toast.error("Error al eliminar la sesión de asistencia")
        console.error("Error deleting session:", err)
      }
    }
  }

  const filteredSessions = sessions.filter((session) => {
    // Filter by date
    if (filterDate && session.date !== filterDate) {
      return false
    }

    // Filter by search term (classroom name, topic, or notes)
    if (searchTerm) {
      const classroomName = (session.classroom as any).name ? (session.classroom as any).name.toLowerCase() : ""
      const topic = session.topic ? session.topic.toLowerCase() : ""
      const notes = session.notes ? session.notes.toLowerCase() : ""

      return (
        classroomName.includes(searchTerm.toLowerCase()) ||
        topic.includes(searchTerm.toLowerCase()) ||
        notes.includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  if (loading) {
    return <div className="loading">Cargando sesiones de asistencia...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="attendance-session-list">
      <div className="list-header">
        <h1>Sesiones de Asistencia</h1>
        <Link to="/attendance-sessions/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nueva Sesión
        </Link>
      </div>

      <div className="filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por salón, tema o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <label>Fecha:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-date"
            />
            {filterDate && (
              <button className="clear-filter" onClick={() => setFilterDate("")} title="Limpiar filtro de fecha">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="no-data">
          {searchTerm || filterDate
            ? "No se encontraron sesiones con los filtros aplicados"
            : "No hay sesiones de asistencia registradas"}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Salón</th>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Tema</th>
                <th>Asistencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    {(session.classroom as any).name
                      ? `${(session.classroom as any).name} (${(session.classroom as any).courseCode})`
                      : "Salón"}
                  </td>
                  <td>{new Date(session.date).toLocaleDateString()}</td>
                  <td>{session.startTime}</td>
                  <td>{session.endTime || "-"}</td>
                  <td>{session.topic || "-"}</td>
                  <td>
                    {session.attendanceRecords ? (
                      <span>
                        {session.attendanceRecords.filter((record) => record.present).length} /{" "}
                        {session.attendanceRecords.length}
                      </span>
                    ) : (
                      "No registrada"
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/attendance-sessions/${session.id}`} className="btn-action view">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/attendance-sessions/${session.id}/take`} className="btn-action edit">
                      <i className="fas fa-clipboard-check"></i>
                    </Link>
                    <button className="btn-action delete" onClick={() => session.id && handleDelete(session.id)}>
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

export default AttendanceSessionList

