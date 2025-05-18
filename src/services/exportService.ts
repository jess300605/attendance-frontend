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

// Función para exportar asistencia para impresión
export const exportAttendanceForPrinting = (
  classroomName: string,
  students: any[],
  attendanceData: any[],
  month: number,
  year: number,
  fileName = "Asistencia_Impresion",
): boolean => {
  try {
    if (!students || students.length === 0) {
      console.error("No hay estudiantes para exportar")
      return false
    }

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Obtener el número de días en el mes
    const daysInMonth = new Date(year, month, 0).getDate()

    // Crear encabezados: Nombre del estudiante + un día por columna
    const headers = ["ID", "Apellido", "Nombre"]
    for (let day = 1; day <= daysInMonth; day++) {
      headers.push(day.toString())
    }
    headers.push("Total Presentes", "Total Ausentes", "Porcentaje")

    // Preparar los datos para la hoja de cálculo
    const data = [headers]

    // Procesar cada estudiante
    students.forEach((student) => {
      const studentRow = [student.id, student.lastName, student.firstName]

      let presentCount = 0
      let absentCount = 0
      const studentNotes: Record<number, string> = {} // Para almacenar notas por día

      // Para cada día del mes
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day)
        const dateString = date.toISOString().split("T")[0]

        // Buscar si hay registro de asistencia para este estudiante en esta fecha
        const attendanceRecord = attendanceData.find(
          (record) => record.studentId === student.id && record.date.split("T")[0] === dateString,
        )

        if (attendanceRecord) {
          if (attendanceRecord.present) {
            studentRow.push("P")
            presentCount++
          } else {
            studentRow.push("A")
            absentCount++
          }

          // Guardar la nota si existe
          if (attendanceRecord.notes) {
            studentNotes[day] = attendanceRecord.notes
          }
        } else {
          // Si no hay registro para este día
          const dayOfWeek = date.getDay()
          // No marcar los fines de semana (0 = domingo, 6 = sábado)
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            studentRow.push("-")
          } else {
            studentRow.push("")
          }
        }
      }

      // Añadir totales y porcentaje
      const totalDays = presentCount + absentCount
      const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(2) + "%" : "0%"

      studentRow.push(presentCount.toString())
      studentRow.push(absentCount.toString())
      studentRow.push(percentage)

      data.push(studentRow)
    })

    // Crear la hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Establecer anchos de columna
    const colWidths = [
      { wch: 5 }, // ID
      { wch: 15 }, // Apellido
      { wch: 15 }, // Nombre
    ]

    // Ancho para las columnas de días
    for (let i = 0; i < daysInMonth; i++) {
      colWidths.push({ wch: 3 })
    }

    // Ancho para las columnas de totales
    colWidths.push({ wch: 8 }, { wch: 8 }, { wch: 8 })

    worksheet["!cols"] = colWidths

    // Añadir información de encabezado
    const titleRow = [`Registro de Asistencia: ${classroomName}`]
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const periodRow = [`Mes: ${monthNames[month - 1]} ${year}`]

    // Insertar filas de título antes de los datos
    XLSX.utils.sheet_add_aoa(worksheet, [titleRow, periodRow, [""]], { origin: "A1" })

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia")

    // NUEVA FUNCIONALIDAD: Crear una hoja adicional para las notas
    const notesData: any[][] = [["ID", "Apellido", "Nombre", "Día", "Presente", "Notas"]]

    // Recopilar todas las notas
    students.forEach((student) => {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day)
        const dateString = date.toISOString().split("T")[0]

        const attendanceRecord = attendanceData.find(
          (record) => record.studentId === student.id && record.date.split("T")[0] === dateString,
        )

        if (attendanceRecord) {
          notesData.push([
            student.id,
            student.lastName,
            student.firstName,
            day,
            attendanceRecord.present ? "Presente" : "Ausente",
            attendanceRecord.notes || "",
          ])
        }
      }
    })

    // Solo crear la hoja de notas si hay datos
    if (notesData.length > 1) {
      const notesWorksheet = XLSX.utils.aoa_to_sheet(notesData)

      // Configurar anchos de columna para la hoja de notas
      notesWorksheet["!cols"] = [
        { wch: 5 }, // ID
        { wch: 15 }, // Apellido
        { wch: 15 }, // Nombre
        { wch: 5 }, // Día
        { wch: 10 }, // Presente/Ausente
        { wch: 40 }, // Notas
      ]

      XLSX.utils.book_append_sheet(workbook, notesWorksheet, "Notas")
    }

    // Guardar el archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error("Error al exportar asistencia para impresión:", error)
    return false
  }
}

// NUEVA FUNCIÓN: Exportar asistencia simplificada por salón
export const exportSimpleAttendanceByClassroom = (
  classroomName: string,
  attendanceData: any[],
  fileName = "Asistencia_Simplificada",
): boolean => {
  try {
    if (!attendanceData || attendanceData.length === 0) {
      console.error("No hay datos de asistencia para exportar")
      return false
    }

    // Preparar los datos en formato simplificado
    const simplifiedData = attendanceData.map((record) => {
      // Extraer el nombre del estudiante
      const studentName = record.student
        ? `${record.student.lastName}, ${record.student.firstName}`
        : record.studentName || "Estudiante sin nombre"

      // Formatear la fecha
      const date =
        record.date instanceof Date ? record.date.toLocaleDateString() : new Date(record.date).toLocaleDateString()

      // Crear el registro simplificado
      return {
        Nombre: studentName,
        Día: date,
        Clase: classroomName,
        Estado: record.present ? "Presente" : "Ausente",
      }
    })

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()

    // Crear la hoja de trabajo desde los datos simplificados
    const worksheet = XLSX.utils.json_to_sheet(simplifiedData)

    // Configurar anchos de columna
    worksheet["!cols"] = [
      { wch: 25 }, // Nombre
      { wch: 12 }, // Día
      { wch: 20 }, // Clase
      { wch: 10 }, // Estado
    ]

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia Simplificada")

    // Guardar el archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error("Error al exportar asistencia simplificada:", error)
    return false
  }
}
