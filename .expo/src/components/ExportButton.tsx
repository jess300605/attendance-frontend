// src/components/ExportButton.tsx
import React from 'react';
import './ExportButton.css';

interface ExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  onClick, 
  disabled = false,
  label = "Exportar a Excel"
}) => {
  return (
    <button 
      className="export-button" 
      onClick={onClick} 
      disabled={disabled}
      aria-label={label}
    >
      <i className="fas fa-file-excel"></i>
      <span>{label}</span>
    </button>
  );
};

export default ExportButton;