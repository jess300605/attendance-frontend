import * as XLSX from "xlsx"

// Función genérica para exportar datos a Excel
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  columnMapping?: Record<string, string>,
): boolean => {
  try {
    if (!data || data.length === 0) {
      console.error("No hay datos para exportar")
      return false
    }

    // Si se proporciona un mapeo de columnas, transformar los datos
    const exportData: Record<string, any>[] = columnMapping
      ? data.map((item) => {
          const mappedItem: Record<string, any> = {}
          Object.keys(item).forEach((key) => {
            if (columnMapping[key]) {
              mappedItem[columnMapping[key]] = formatValue(item[key])
            } else {
              mappedItem[key] = formatValue(item[key])
            }
          })
          return mappedItem
        })
      : [...data] // Crear una copia del array original

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

    // Guardar el archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error("Error al exportar a Excel:", error)
    return false
  }
}

// Función para formatear valores especiales
const formatValue = (value: any): any => {
  if (value === true) return "Sí"
  if (value === false) return "No"
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toLocaleDateString()
  return value
}

// Exportar estudiantes
export const exportStudentsToExcel = (students: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    phone: "Teléfono",
    grade: "Grado",
    section: "Sección",
    enrollmentDate: "Fecha de Inscripción",
    active: "Activo",
  }

  return exportToExcel(students, fileName, columnMapping)
}

// Exportar asistencias
export const exportAttendancesToExcel = (attendances: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    date: "Fecha",
    studentName: "Estudiante",
    present: "Presente",
    comment: "Comentario",
    classroomName: "Aula",
    teacherName: "Profesor",
  }

  // Transformar datos de asistencia para mejor visualización
  const formattedAttendances = attendances.map((attendance) => ({
    ...attendance,
    present: attendance.present ? "Presente" : "Ausente",
    date:
      attendance.date instanceof Date
        ? attendance.date.toLocaleDateString()
        : new Date(attendance.date).toLocaleDateString(),
  }))

  return exportToExcel(formattedAttendances, fileName, columnMapping)
}

// Exportar calificaciones
export const exportGradesToExcel = (grades: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    studentName: "Estudiante",
    subject: "Asignatura",
    score: "Calificación",
    date: "Fecha",
    comment: "Comentario",
    teacherName: "Profesor",
  }

  return exportToExcel(grades, fileName, columnMapping)
}

// Exportar sesiones de asistencia
export const exportAttendanceSessionsToExcel = (sessions: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    date: "Fecha",
    classroomName: "Aula",
    teacherName: "Profesor",
    totalStudents: "Total Estudiantes",
    presentCount: "Presentes",
    absentCount: "Ausentes",
  }

  return exportToExcel(sessions, fileName, columnMapping)
}

// Exportar profesores
export const exportTeachersToExcel = (teachers: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    phone: "Teléfono",
    subject: "Asignatura",
    active: "Activo",
  }

  return exportToExcel(teachers, fileName, columnMapping)
}

// Exportar aulas
export const exportClassroomsToExcel = (classrooms: any[], fileName: string): boolean => {
  const columnMapping = {
    id: "ID",
    name: "Nombre",
    grade: "Grado",
    section: "Sección",
    teacherName: "Profesor",
    studentCount: "Cantidad de Estudiantes",
  }

  return exportToExcel(classrooms, fileName, columnMapping)
}
