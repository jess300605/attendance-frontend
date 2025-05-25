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
  grades: any[] = [], // Nuevo parámetro para las calificaciones
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

    // 3. NUEVA HOJA DE CALIFICACIONES
    if (grades && grades.length > 0) {
      // Preparar los datos de calificaciones
      const gradesData: any[][] = [
        ["ID", "Apellido", "Nombre", "Tipo de Evaluación", "Calificación", "Fecha", "Comentarios"],
      ]

      // Agrupar calificaciones por estudiante
      const studentGrades: Record<number, any[]> = {}

      grades.forEach((grade) => {
        const studentId = grade.student?.id || (typeof grade.student === "number" ? grade.student : null)
        if (studentId) {
          if (!studentGrades[studentId]) {
            studentGrades[studentId] = []
          }
          studentGrades[studentId].push(grade)
        }
      })

      // Añadir las calificaciones de cada estudiante
      students.forEach((student) => {
        const studentId = student.id
        const studentGradesList = studentGrades[studentId] || []

        if (studentGradesList.length > 0) {
          studentGradesList.forEach((grade) => {
            gradesData.push([
              studentId,
              student.lastName || "",
              student.firstName || "",
              grade.evaluationType || "",
              grade.score || "",
              grade.date ? new Date(grade.date).toLocaleDateString() : "",
              grade.comments || "",
            ])
          })
        } else {
          // Añadir una fila vacía para estudiantes sin calificaciones
          gradesData.push([studentId, student.lastName || "", student.firstName || "", "Sin evaluaciones", "", "", ""])
        }
      })

      // Crear la hoja de calificaciones
      const gradesWorksheet = XLSX.utils.aoa_to_sheet(gradesData)

      // Configurar anchos de columna
      gradesWorksheet["!cols"] = [
        { wch: 5 }, // ID
        { wch: 15 }, // Apellido
        { wch: 15 }, // Nombre
        { wch: 20 }, // Tipo de Evaluación
        { wch: 10 }, // Calificación
        { wch: 12 }, // Fecha
        { wch: 30 }, // Comentarios
      ]

      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(workbook, gradesWorksheet, "Calificaciones")
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

// Exportar información completa de un salón (estudiantes, notas, pertenencia y calificaciones)
export const exportClassroomFullInfo = (classroom: any, fileName = "Información_Salón"): boolean => {
  try {
    if (!classroom || !classroom.students || classroom.students.length === 0) {
      console.error("No hay información del salón para exportar")
      return false
    }

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()

    // 1. HOJA DE ESTUDIANTES
    const studentsData = classroom.students.map((student: any) => ({
      ID: student.id,
      "Número de Estudiante": student.studentId || "",
      Apellido: student.lastName || "",
      Nombre: student.firstName || "",
      Email: student.email || "",
      Teléfono: student.phone || "",
      "Fecha de Inscripción": student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "",
      Activo: student.active ? "Sí" : "No",
      Salón: classroom.name,
      "Código de Curso": classroom.courseCode || "",
      Grado: classroom.grade || "",
      Sección: classroom.section || "",
    }))

    if (studentsData.length > 0) {
      const studentsWorksheet = XLSX.utils.json_to_sheet(studentsData)

      // Configurar anchos de columna
      studentsWorksheet["!cols"] = [
        { wch: 5 }, // ID
        { wch: 15 }, // Número de Estudiante
        { wch: 15 }, // Apellido
        { wch: 15 }, // Nombre
        { wch: 25 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 15 }, // Fecha de Inscripción
        { wch: 8 }, // Activo
        { wch: 15 }, // Salón
        { wch: 15 }, // Código de Curso
        { wch: 10 }, // Grado
        { wch: 10 }, // Sección
      ]

      XLSX.utils.book_append_sheet(workbook, studentsWorksheet, "Estudiantes")
    }

    // 2. HOJA DE NOTAS DE ASISTENCIA (si hay datos de asistencia)
    if (classroom.attendanceSessions && classroom.attendanceSessions.length > 0) {
      const notesData: any[] = []

      // Recopilar todas las notas de asistencia
      classroom.attendanceSessions.forEach((session: any) => {
        if (session.attendanceRecords && session.attendanceRecords.length > 0) {
          session.attendanceRecords.forEach((record: any) => {
            if (record.student) {
              notesData.push({
                "ID Estudiante": record.student.id,
                Apellido: record.student.lastName || "",
                Nombre: record.student.firstName || "",
                Fecha: new Date(session.date).toLocaleDateString(),
                Presente: record.present ? "Sí" : "No",
                "Hora de Entrada": record.timeIn || "",
                "Hora de Salida": record.timeOut || "",
                Notas: record.notes || "",
                "Tema de Clase": session.topic || "",
                Salón: classroom.name,
              })
            }
          })
        }
      })

      if (notesData.length > 0) {
        const notesWorksheet = XLSX.utils.json_to_sheet(notesData)

        // Configurar anchos de columna
        notesWorksheet["!cols"] = [
          { wch: 10 }, // ID Estudiante
          { wch: 15 }, // Apellido
          { wch: 15 }, // Nombre
          { wch: 12 }, // Fecha
          { wch: 8 }, // Presente
          { wch: 12 }, // Hora de Entrada
          { wch: 12 }, // Hora de Salida
          { wch: 30 }, // Notas
          { wch: 20 }, // Tema de Clase
          { wch: 15 }, // Salón
        ]

        XLSX.utils.book_append_sheet(workbook, notesWorksheet, "Asistencia y Notas")
      }
    }

    // 3. NUEVA HOJA DE CALIFICACIONES
    if (classroom.grades && classroom.grades.length > 0) {
      const gradesData = classroom.grades.map((grade: any) => {
        const student = grade.student || {}
        return {
          "ID Estudiante": student.id || "",
          Apellido: student.lastName || "",
          Nombre: student.firstName || "",
          "Tipo de Evaluación": grade.evaluationType || "",
          Calificación: grade.score || "",
          Fecha: grade.date ? new Date(grade.date).toLocaleDateString() : "",
          Comentarios: grade.comments || "",
          Salón: classroom.name,
          "Código de Curso": classroom.courseCode || "",
        }
      })

      if (gradesData.length > 0) {
        const gradesWorksheet = XLSX.utils.json_to_sheet(gradesData)

        // Configurar anchos de columna
        gradesWorksheet["!cols"] = [
          { wch: 10 }, // ID Estudiante
          { wch: 15 }, // Apellido
          { wch: 15 }, // Nombre
          { wch: 20 }, // Tipo de Evaluación
          { wch: 10 }, // Calificación
          { wch: 12 }, // Fecha
          { wch: 30 }, // Comentarios
          { wch: 15 }, // Salón
          { wch: 15 }, // Código de Curso
        ]

        XLSX.utils.book_append_sheet(workbook, gradesWorksheet, "Calificaciones")
      }
    } else if (classroom.students && classroom.students.length > 0) {
      // Si no hay calificaciones en el objeto classroom pero hay estudiantes,
      // intentamos buscar calificaciones en los estudiantes
      const gradesData: any[] = []

      classroom.students.forEach((student: any) => {
        if (student.grades && student.grades.length > 0) {
          student.grades.forEach((grade: any) => {
            gradesData.push({
              "ID Estudiante": student.id || "",
              Apellido: student.lastName || "",
              Nombre: student.firstName || "",
              "Tipo de Evaluación": grade.evaluationType || "",
              Calificación: grade.score || "",
              Fecha: grade.date ? new Date(grade.date).toLocaleDateString() : "",
              Comentarios: grade.comments || "",
              Salón: classroom.name,
              "Código de Curso": classroom.courseCode || "",
            })
          })
        }
      })

      if (gradesData.length > 0) {
        const gradesWorksheet = XLSX.utils.json_to_sheet(gradesData)

        // Configurar anchos de columna
        gradesWorksheet["!cols"] = [
          { wch: 10 }, // ID Estudiante
          { wch: 15 }, // Apellido
          { wch: 15 }, // Nombre
          { wch: 20 }, // Tipo de Evaluación
          { wch: 10 }, // Calificación
          { wch: 12 }, // Fecha
          { wch: 30 }, // Comentarios
          { wch: 15 }, // Salón
          { wch: 15 }, // Código de Curso
        ]

        XLSX.utils.book_append_sheet(workbook, gradesWorksheet, "Calificaciones")
      }
    }

    // 4. HOJA DE INFORMACIÓN DEL SALÓN
    const classroomInfo = [
      { Campo: "ID", Valor: classroom.id },
      { Campo: "Nombre", Valor: classroom.name || "" },
      { Campo: "Código de Curso", Valor: classroom.courseCode || "" },
      { Campo: "Grado", Valor: classroom.grade || "" },
      { Campo: "Sección", Valor: classroom.section || "" },
      {
        Campo: "Profesor",
        Valor: classroom.teacher ? `${classroom.teacher.firstName} ${classroom.teacher.lastName}` : "No asignado",
      },
      { Campo: "Cantidad de Estudiantes", Valor: classroom.students ? classroom.students.length : 0 },
      { Campo: "Cantidad de Sesiones", Valor: classroom.attendanceSessions ? classroom.attendanceSessions.length : 0 },
      { Campo: "Cantidad de Calificaciones", Valor: classroom.grades ? classroom.grades.length : 0 },
    ]

    const infoWorksheet = XLSX.utils.json_to_sheet(classroomInfo)

    // Configurar anchos de columna
    infoWorksheet["!cols"] = [
      { wch: 20 }, // Campo
      { wch: 30 }, // Valor
    ]

    XLSX.utils.book_append_sheet(workbook, infoWorksheet, "Información del Salón")

    // Guardar el archivo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)

    return true
  } catch (error) {
    console.error("Error al exportar información del salón:", error)
    return false
  }
}
