"use client"

import type React from "react"
import "./MonthYearPicker.css"

interface MonthYearPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ month, year, onMonthChange, onYearChange }) => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Generar años desde 5 años atrás hasta 5 años adelante
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  return (
    <div className="month-year-picker">
      <div className="picker-group">
        <label htmlFor="month-select">Mes:</label>
        <select id="month-select" value={month} onChange={(e) => onMonthChange(Number.parseInt(e.target.value))}>
          {months.map((monthName, index) => (
            <option key={index} value={index + 1}>
              {monthName}
            </option>
          ))}
        </select>
      </div>

      <div className="picker-group">
        <label htmlFor="year-select">Año:</label>
        <select id="year-select" value={year} onChange={(e) => onYearChange(Number.parseInt(e.target.value))}>
          {years.map((yearValue) => (
            <option key={yearValue} value={yearValue}>
              {yearValue}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default MonthYearPicker
