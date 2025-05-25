"use client"

import type React from "react"
<<<<<<< HEAD
import "./SimpleAttendanceExportButton.css" // Usaremos un nuevo archivo CSS para este componente
=======
import "./PrintExportButton.css" // Reutilizamos los estilos
>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1

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
<<<<<<< HEAD
    <button className="simple-attendance-export-button" onClick={onClick} disabled={disabled} aria-label={label}>
=======
    <button className="print-export-button simple-export" onClick={onClick} disabled={disabled} aria-label={label}>
>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1
      <i className="fas fa-file-excel"></i>
      <span>{label}</span>
    </button>
  )
}

export default SimpleAttendanceExportButton
