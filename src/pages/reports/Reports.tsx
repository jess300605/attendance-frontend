"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getStudents } from "../../services/studentService"
import { getTeachers } from "../../services/teacherService"
import { getGradesByStudent } from "../../services/gradeService"
import { getStudentAttendanceBetweenDates, getTeacherAttendanceBetweenDates } from "../../services/attendanceService"
import type { Student, Teacher, Grade, Attendance } from "../../types"
import "./Reports.css"

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<"student-grades" | "student-attendance" | "teacher-attendance">(
    "student-grades",
  )
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [reportGenerated, setReportGenerated] = useState<boolean>(false)

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    try {
      setLoading(true)
      const [studentsData, teachersData] = await Promise.all([getStudents(), getTeachers()])

      setStudents(studentsData)
      setTeachers(teachersData)
      setLoading(false)
    } catch (err) {
      setError("Error al cargar los datos")
      setLoading(false)
      console.error("Error fetching entities:", err)
    }
  }

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value as any)
    setReportGenerated(false)
    setReportData([])
  }

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      setError(null)
      setReportData([])

      let data: any[] = []

      switch (reportType) {
        case "student-grades":
          if (!selectedStudentId) {
            setError("Por favor selecciona un estudiante")
            setLoading(false)
            return
          }

          data = await getGradesByStudent(selectedStudentId)
          break

        case "student-attendance":
          if (!selectedStudentId || !startDate || !endDate) {
            setError("Por favor completa todos los campos")
            setLoading(false)
            return
          }

          data = await getStudentAttendanceBetweenDates(selectedStudentId, startDate, endDate)
          break

        case "teacher-attendance":
          if (!selectedTeacherId || !startDate || !endDate) {
            setError("Por favor completa todos los campos")
            setLoading(false)
            return
          }

          data = await getTeacherAttendanceBetweenDates(selectedTeacherId, startDate, endDate)
          break
      }

      setReportData(data)
      setReportGenerated(true)
      setLoading(false)
    } catch (err) {
      setError("Error al generar el reporte")
      setLoading(false)
      console.error("Error generating report:", err)
    }
  }

  const renderReportForm = () => {
    switch (reportType) {
      case "student-grades":
        return (
          <div className="report-form">
            <div className="form-group">
              <label htmlFor="studentId">Estudiante</label>
              <select
                id="studentId"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number.parseInt(e.target.value))}
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
          </div>
        )

      case "student-attendance":
        return (
          <div className="report-form">
            <div className="form-group">
              <label htmlFor="studentId">Estudiante</label>
              <select
                id="studentId"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number.parseInt(e.target.value))}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Fecha Inicio</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Fecha Fin</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>
        )

      case "teacher-attendance":
        return (
          <div className="report-form">
            <div className="form-group">
              <label htmlFor="teacherId">Profesor</label>
              <select
                id="teacherId"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(Number.parseInt(e.target.value))}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Fecha Inicio</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Fecha Fin</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderReportResults = () => {
    if (!reportGenerated) return null

    if (reportData.length === 0) {
      return <div className="no-data">No hay datos para mostrar con los criterios seleccionados</div>
    }

    switch (reportType) {
      case "student-grades":
        return (
          <div className="report-results">
            <h3>Calificaciones del Estudiante</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Calificación</th>
                  <th>Fecha</th>
                  <th>Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((grade: Grade, index) => (
                  <tr key={index}>
                    <td>{grade.evaluationType}</td>
                    <td className="grade-score">{grade.score}</td>
                    <td>{new Date(grade.date).toLocaleDateString()}</td>
                    <td>{grade.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="report-summary">
              <p>
                <strong>Promedio:</strong>{" "}
                {(reportData.reduce((sum: number, grade: Grade) => sum + grade.score, 0) / reportData.length).toFixed(
                  2,
                )}
              </p>
              <p>
                <strong>Total de Materias:</strong> {reportData.length}
              </p>
            </div>
          </div>
        )

      case "student-attendance":
      case "teacher-attendance":
        const entityType = reportType === "student-attendance" ? "Estudiante" : "Profesor"
        const totalDays = reportData.length
        const presentDays = reportData.filter((record: Attendance) => record.present).length
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

        return (
          <div className="report-results">
            <h3>Asistencia del {entityType}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Presente</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((record: Attendance, index) => (
                  <tr key={index}>
                    <td>{new Date((record.attendanceSession as any).date).toLocaleDateString()}</td>
                    <td>{record.timeIn}</td>
                    <td>{record.timeOut || "-"}</td>
                    <td>
                      <span className={`badge ${record.present ? "badge-success" : "badge-danger"}`}>
                        {record.present ? "Sí" : "No"}
                      </span>
                    </td>
                    <td>{record.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="report-summary">
              <p>
                <strong>Días Totales:</strong> {totalDays}
              </p>
              <p>
                <strong>Días Presente:</strong> {presentDays}
              </p>
              <p>
                <strong>Tasa de Asistencia:</strong> {attendanceRate.toFixed(2)}%
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading && !reportGenerated) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="reports">
      <h1>Reportes</h1>

      <div className="report-container">
        <div className="report-options">
          <div className="form-group">
            <label htmlFor="reportType">Tipo de Reporte</label>
            <select id="reportType" value={reportType} onChange={handleReportTypeChange} className="form-control">
              <option value="student-grades">Calificaciones de Estudiante</option>
              <option value="student-attendance">Asistencia de Estudiante</option>
              <option value="teacher-attendance">Asistencia de Profesor</option>
            </select>
          </div>

          {renderReportForm()}

          {error && <div className="alert alert-danger">{error}</div>}

          <button className="btn btn-primary generate-btn" onClick={handleGenerateReport} disabled={loading}>
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
        </div>

        {renderReportResults()}
      </div>
    </div>
  )
}

export default Reports

