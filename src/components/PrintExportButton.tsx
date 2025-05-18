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
  label = "Exportar para Impresión",
}) => {
  return (
    <button className="print-export-button" onClick={onClick} disabled={disabled} aria-label={label}>
      <i className="fas fa-print"></i>
      <span>{label}</span>
    </button>
  )
}

export default PrintExportButton
