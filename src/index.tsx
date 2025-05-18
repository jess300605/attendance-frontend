import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/theme-variables.css'; // Importar antes que otros estilos
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Inicializar el tema basado en la preferencia guardada o la preferencia del sistema
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    return;
  }
  
  // Verificar preferencia del sistema
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

initializeTheme();

// Crear la raíz de React usando la nueva API de React 18
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();