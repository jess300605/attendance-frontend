"use client"

import type React from "react"
import "./SimpleAttendanceExportButton.css" // Usaremos un nuevo archivo CSS para este componente

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
    <button className="simple-attendance-export-button" onClick={onClick} disabled={disabled} aria-label={label}>
      <i className="fas fa-file-excel"></i>
      <span>{label}</span>
    </button>
  )
}

export default SimpleAttendanceExportButton
