import type React from "react"
import "./StatCard.css"

interface StatCardProps {
  title: string
  value: number | string
  icon: string
  color: string
  increase?: number
  link?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, increase, link }) => {
  return (
    <div className="stat-card-modern" style={{ "--card-color": color } as React.CSSProperties}>
      <div className="stat-card-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-card-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {increase !== undefined && (
          <p className={`stat-change ${increase >= 0 ? "positive" : "negative"}`}>
            <i className={`fas fa-arrow-${increase >= 0 ? "up" : "down"}`}></i>
            {Math.abs(increase)}% desde el mes pasado
          </p>
        )}
        {link && (
          <a href={link} className="stat-link">
            Ver detalles <i className="fas fa-arrow-right"></i>
          </a>
        )}
      </div>
    </div>
  )
}

export default StatCard
