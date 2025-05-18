"use client"

import type React from "react"
import "./PrintExportButton.css" // Reutilizamos los estilos

interface SimpleAttendanceExportButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

const SimpleAttendanceExportButton: React.FC<SimpleAttendanceExportButtonProps> = ({
  onClick,
  disabled = false,
  label = "Exportar Asistencia Simple",
}) => {
  return (
    <button className="print-export-button simple-export" onClick={onClick} disabled={disabled} aria-label={label}>
      <i className="fas fa-file-excel"></i>
      <span>{label}</span>
    </button>
  )
}

export default SimpleAttendanceExportButton
