import axios from "axios"

const API_URL = "http://localhost:8080/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    if (response) {
      // Handle specific error status codes
      switch (response.status) {
        case 401:
          // Handle unauthorized - redirect to login
          console.error("Unauthorized access")
          localStorage.removeItem("token")
          localStorage.removeItem("teacherId")
          localStorage.removeItem("teacherName")
          window.location.href = "/login"
          break
        case 403:
          // Handle forbidden
          console.error("Forbidden access")
          break
        case 404:
          // Handle not found
          console.error("Resource not found")
          break
        case 500:
          // Handle server error
          console.error("Server error")
          break
        default:
          // Handle other errors
          console.error("API error:", response.data)
      }
    } else {
      // Handle network errors
      console.error("Network error")
    }
    return Promise.reject(error)
  },
)

export default api

