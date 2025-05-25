import type React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { isAuthenticated } from "../services/authService"

const PrivateRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute

