import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"

// Layouts
import MainLayout from "./layouts/MainLayout"

// Auth Components
import PrivateRoute from "./components/PrivateRoute"
import Login from "./pages/Login"

// Pages
import TeacherDashboard from "./pages/TeacherDashboard"
import ClassroomDetail from "./pages/ClassroomDetail"
import ClassroomForm from "./pages/ClassroomForm"
import StudentList from "./pages/students/StudentList"
import StudentForm from "./pages/students/StudentForm"
import StudentDetail from "./pages/students/StudentDetail"
import AttendanceSessionForm from "./pages/AttendanceSessionForm"
import AttendanceSessionList from "./pages/attendanceSessionList"
import AttendanceSessionDetail from "./pages/AttendanceSessionDetail"
import TakeAttendance from "./pages/TakeAttendance"
import SimpleAttendance from "./pages/SimpleAttendance" // Página simplificada
import GradeForm from "./pages/GradeForm"
import GradeList from "./pages/GradeList"
import Reports from "./pages/reports/Reports"

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<TeacherDashboard />} />

            {/* Classroom Routes */}
            <Route path="/classrooms/:id" element={<ClassroomDetail />} />
            <Route path="/classrooms/new" element={<ClassroomForm />} />
            <Route path="/classrooms/edit/:id" element={<ClassroomForm />} />
            <Route path="/classrooms/:id/students/add" element={<StudentList />} />

            {/* Student Routes */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/edit/:id" element={<StudentForm />} />
            <Route path="/students/:id" element={<StudentDetail />} />

            {/* Attendance Routes - Usando la página simplificada */}
            <Route path="/attendance" element={<SimpleAttendance />} />
            <Route path="/attendance/:classroomId" element={<SimpleAttendance />} />

            {/* Attendance Session Routes */}
            <Route path="/attendance-sessions" element={<AttendanceSessionList />} />
            <Route path="/attendance-sessions/new" element={<AttendanceSessionForm />} />
            <Route path="/attendance-sessions/:id" element={<AttendanceSessionDetail />} />
            <Route path="/attendance-sessions/edit/:id" element={<AttendanceSessionForm />} />
            <Route path="/attendance-sessions/:id/take" element={<TakeAttendance />} />

            {/* Grade Routes */}
            <Route path="/grades" element={<GradeList />} />
            <Route path="/grades/new" element={<GradeForm />} />
            <Route path="/grades/edit/:id" element={<GradeForm />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

