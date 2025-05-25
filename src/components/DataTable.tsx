"use client"

import type React from "react"
import "./DataTable.css"

interface Column {
  key: string
  header: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  actions?: {
    edit?: boolean
    delete?: boolean
    view?: boolean
    custom?: Array<{
      icon: string
      label: string
      onClick: (row: any) => void
    }>
  }
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, actions, onEdit, onDelete, onView }) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
            {actions && <th className="actions-column">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>
              ))}
              {actions && (
                <td className="actions-cell">
                  {actions.view && (
                    <button className="action-btn view-btn" onClick={() => onView && onView(row)} title="Ver detalles">
                      <i className="fas fa-eye"></i>
                    </button>
                  )}
                  {actions.edit && (
                    <button className="action-btn edit-btn" onClick={() => onEdit && onEdit(row)} title="Editar">
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                  {actions.delete && (
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete && onDelete(row)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                  {actions.custom &&
                    actions.custom.map((action, index) => (
                      <button
                        key={index}
                        className="action-btn custom-btn"
                        onClick={() => action.onClick(row)}
                        title={action.label}
                      >
                        <i className={`fas ${action.icon}`}></i>
                      </button>
                    ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
