"use client"

import type React from "react"
import "./ClassroomExportButton.css"

interface ClassroomExportButtonProps {
  onClick: (event?: React.MouseEvent) => void
  disabled?: boolean
  label?: string
  className?: string
}

const ClassroomExportButton: React.FC<ClassroomExportButtonProps> = ({
  onClick,
  disabled = false,
  label = "Exportar Información",
  className = "",
}) => {
  return (
    <button
      className={`classroom-export-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label || "Exportar Información"}
      title={label || "Exportar Información"}
    >
      <i className="fas fa-file-excel"></i>
      {label && <span>{label}</span>}
    </button>
  )
}

export default ClassroomExportButton
