### README  Sistema de Gestión de Asistencia Escolar

### 🎓 Sistema de Gestión de Asistencia Escolar - Frontend

### 📋 Descripción General

El frontend del Sistema de Gestión de Asistencia Escolar es una aplicación web desarrollada en React con TypeScript 
que proporciona una interfaz intuitiva para que los docentes gestionen la asistencia de sus estudiantes, administren aulas, 
registren calificaciones y generen reportes. Esta aplicación se conecta a una API REST desarrollada en 
Java para la persistencia de datos.
```plaintext
--🚀 Características Principales
--🏫 Gestión de Aulas: Crear, editar y eliminar aulas/salones
--👨‍🎓 Gestión de Estudiantes: Administrar información de estudiantes
--✅ Registro de Asistencia: Interfaz simplificada para tomar asistencia
--📊 Calificaciones: Registro y seguimiento de calificaciones
--📑 Exportación a Excel: Generación de reportes en formato Excel
--🌓 Tema Claro/Oscuro: Personalización de la interfaz
--🔔 Sistema de Notificaciones: Alertas y mensajes informativos
--📱 Diseño Responsivo: Adaptable a diferentes dispositivos
```

### 1. 🛠 Requisitos del Sistema
```plaintext
--Node.js 14.x o superior
--npm 6.x o superior o yarn 1.22.x o superior
--Navegador web moderno (Chrome, Firefox, Edge, Safari)
--Conexión a la API backend (Java)
```

### ⚙️ Instalación y Configuración
```plaintext
--1. Clonar el Repositorio
git clone https://github.com/su-usuario/attendance-frontend.git
cd attendance-frontend
```
### 2. Instalar Dependencias

```shellscript
# Usando npm
npm install

# O usando yarn
yarn install
```

### 3. Configurar Variables de Entorno

Cree un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```plaintext
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VERSION=1.0.0
```

### 4. Iniciar la Aplicación en Modo Desarrollo

```shellscript
# Usando npm
npm start

# O usando yarn
yarn start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 5. Compilar para Producción

```shellscript
# Usando npm
npm run build

# O usando yarn
yarn build
```

Los archivos compilados se generarán en la carpeta `build/`

## 📁 Estructura del Proyecto

```plaintext
attendance-frontend/
├── public/                  # Archivos públicos estáticos
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── context/             # Contextos de React
│   ├── layouts/             # Layouts de la aplicación
│   ├── pages/               # Páginas/Vistas
│   ├── services/            # Comunicación con la API
│   ├── styles/              # Estilos y temas
│   ├── types/               # Definiciones TypeScript
│   ├── utils/               # Utilidades y helpers
│   ├── App.tsx              # Componente principal
│   └── index.tsx            # Punto de entrada
├── .env                     # Variables de entorno
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
└── README.md                # Documentación del proyecto
```

## 📦 Dependencias

### Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.1",
    "react-toastify": "^9.1.3",
    "xlsx": "^0.18.5",
    "@fortawesome/fontawesome-free": "^6.4.0",
    "typescript": "^5.1.6",
    "web-vitals": "^3.3.2"
  }
}
```

### Desarrollo

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.4.1",
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.6",
    "@typescript-eslint/eslint-plugin": "^5.61.0",
    "@typescript-eslint/parser": "^5.61.0",
    "eslint": "^8.44.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.0"
  }
}
```

## 🔗 Integración con la API

La aplicación se comunica con la API backend mediante servicios dedicados.

*Ejemplo - Servicio para obtener aulas:*

```typescript
export const getClassroomsByTeacher = async (teacherId: number): Promise<Classroom[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/classrooms/teacher/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener los salones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## 🧩 Convenciones de Código

- **TypeScript** en todos los archivos
- Nomenclatura:

- PascalCase para componentes React
- camelCase para funciones y variables
- kebab-case para archivos CSS



- Documentar funciones/componentes complejos
- Usar interfaces para props y tipos de datos


## 🛠 Solución de Problemas Comunes

### 🔐 Error de Autenticación

- Verifique el token JWT en localStorage
- Compruebe si ha expirado
- Cierre sesión e intente de nuevo


### 📑 Problemas de Exportación a Excel

- Asegúrese que los datos no sean null o undefined
- Verifique la estructura de los datos
- Revise la consola del navegador


### 🖥 Problemas de Visualización

- Use un navegador moderno
- Borre la caché del navegador
- Verifique las variables CSS


## 📚 Recursos

- [Documentación oficial de React](https://reactjs.org/)
- [Documentación de Create React App](https://github.com/facebook/create-react-app/docs/getting-started)


---

© 2023 **Sistema de Gestión de Asistencia Escolar**. Todos los derechos reservados.
