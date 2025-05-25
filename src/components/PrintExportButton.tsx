"use client"

import type React from "react"
import "./PrintExportButton.css"

interface PrintExportButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

const PrintExportButton: React.FC<PrintExportButtonProps> = ({
  onClick,
  disabled = false,
<<<<<<< HEAD
  label = "Exportar Asistencia y Calificaciones",
=======
  label = "Exportar para Impresión",
>>>>>>> ee2ec35660f398e4321007b3c070aa5b1ac7d7c1
}) => {
  return (
    <button className="print-export-button" onClick={onClick} disabled={disabled} aria-label={label}>
      <i className="fas fa-print"></i>
      <span>{label}</span>
    </button>
  )
}

export default PrintExportButton
