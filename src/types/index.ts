// Student types
export interface Student {
  id?: number
  firstName: string
  lastName: string
  studentId: string
  email: string
  attendanceRecords?: Attendance[]
  grades?: Grade[]
  classrooms?: Classroom[]
}

// Teacher types
export interface Teacher {
  id?: number
  firstName: string
  lastName: string
  employeeId: string
  email: string
  password?: string
  attendanceRecords?: Attendance[]
  classrooms?: Classroom[]
  lastLogin?: string
}

// Classroom types
export interface Classroom {
  id?: number
  name: string
  courseCode: string
  description?: string
  teacher: Teacher | { id: number }
  students?: Student[]
  attendanceSessions?: AttendanceSession[]
}

// AttendanceSession types
export interface AttendanceSession {
  id?: number
  date: string
  startTime: string
  endTime?: string
  topic?: string
  notes?: string
  classroom: Classroom | { id: number }
  attendanceRecords?: Attendance[]
}

// Attendance types
export interface Attendance {
  id?: number
  present: boolean
  timeIn?: string
  timeOut?: string
  notes?: string
  type: "STUDENT" | "TEACHER"
  student?: Student | { id: number }
  teacher?: Teacher | { id: number }
  attendanceSession?: AttendanceSession | { id: number }
  date?: string // Añadimos esta propiedad para compatibilidad
  submitted?: boolean // Añadimos esta propiedad para seguimiento en la UI
}

// Grade types
export interface Grade {
  id?: number
  student: Student | { id: number }
  classroom: Classroom | { id: number }
  evaluationType: string
  score: number
  date: string
  comments?: string
  subject?: string // Añadimos esta propiedad para compatibilidad
}

// Login types
export interface TeacherLogin {
  email: string
  password: string
}

export interface TeacherLoginResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  employeeId: string
  token: string
  attendanceRegistered: boolean
  expiresIn: number // Añadimos la propiedad expiresIn para el tiempo de expiración del token
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
