### Sistema de Gestión de Asistencia Escolar - Frontend

## Descripción General

El frontend del Sistema de Gestión de Asistencia Escolar es una aplicación web desarrollada en React con TypeScript que proporciona una interfaz intuitiva para que los docentes gestionen la asistencia de sus estudiantes, administren aulas, registren calificaciones y generen reportes. Esta aplicación se conecta a una API REST desarrollada en Java para la persistencia de datos.


## Características Principales

- 🏫 *Gestión de Aulas*: Crear, editar y eliminar aulas/salones
- 👨‍🎓 *Gestión de Estudiantes*: Administrar información de estudiantes
- ✅ *Registro de Asistencia*: Interfaz simplificada para tomar asistencia
- 📊 *Calificaciones*: Registro y seguimiento de calificaciones
- 📑 *Exportación a Excel*: Generación de reportes en formato Excel
- 🌓 *Tema Claro/Oscuro*: Personalización de la interfaz
- 🔔 *Sistema de Notificaciones*: Alertas y mensajes informativos
- 📱 *Diseño Responsivo*: Adaptable a diferentes dispositivos


## Requisitos del Sistema

- Node.js 14.x o superior
- npm 6.x o superior o yarn 1.22.x o superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a la API backend (Java)


## Instalación y Configuración

## Dependencias

### Dependencias Principales

json
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


### Dependencias de Desarrollo

json
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


## Instalación y Configuración

### 1. Clonar el Repositorio

shellscript
git clone https://github.com/su-usuario/attendance-frontend.git
cd attendance-frontend


### 2. Instalar Dependencias

shellscript
# Usando npm
npm install

# O usando yarn
yarn install

# Para instalar dependencias específicas
npm install react react-dom react-router-dom react-toastify xlsx @fortawesome/fontawesome-free typescript web-vitals
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest @types/node @types/react @types/react-dom @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-react eslint-plugin-react-hooks prettier


### 3. Configurar Variables de Entorno

Cree un archivo .env en la raíz del proyecto:

plaintext
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VERSION=1.0.0


### 4. Iniciar la Aplicación en Modo Desarrollo

shellscript
# Usando npm
npm start

# O usando yarn
yarn start


La aplicación estará disponible en http://localhost:3000### 4. Iniciar la Aplicación en Modo Desarrollo

shellscript
# Usando npm
npm start

# O usando yarn
yarn start


La aplicación estará disponible en http://localhost:3000

### 5. Compilar para Producción

shellscript
# Usando npm
npm run build

# O usando yarn
yarn build


Los archivos compilados se generarán en la carpeta build/

## Estructura del Proyecto

plaintext
attendance-frontend/
├── public/                  # Archivos públicos estáticos
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Header.tsx       # Encabezado de la aplicación
│   │   ├── ThemeToggle.tsx  # Selector de tema claro/oscuro
│   │   ├── Notification.tsx # Sistema de notificaciones
│   │   └── ...
│   ├── context/             # Contextos de React
│   │   ├── NotificationContext.tsx
│   │   └── ...
│   ├── layouts/             # Layouts de la aplicación
│   │   └── MainLayout.tsx   # Layout principal
│   ├── pages/               # Páginas/Vistas
│   │   ├── Login.tsx        # Página de inicio de sesión
│   │   ├── TeacherDashboard.tsx # Dashboard del profesor
│   │   ├── ClassroomDetail.tsx  # Detalle de aula
│   │   ├── SimpleAttendance.tsx # Toma de asistencia simplificada
│   │   └── ...
│   ├── services/            # Servicios para comunicación con la API
│   │   ├── authService.ts   # Autenticación
│   │   ├── classroomService.ts # Gestión de aulas
│   │   ├── studentService.ts   # Gestión de estudiantes
│   │   ├── exportService.ts    # Exportación a Excel
│   │   └── ...
│   ├── styles/              # Estilos CSS
│   │   ├── theme-variables.css # Variables de tema
│   │   └── ...
│   ├── types/               # Definiciones de tipos TypeScript
│   │   └── index.ts
│   ├── utils/               # Utilidades y helpers
│   ├── App.tsx              # Componente principal
│   └── index.tsx            # Punto de entrada
├── .env                     # Variables de entorno
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
└── README.md                # Este archivo


## Tecnologías Utilizadas

- *React*: Biblioteca principal para la interfaz de usuario
- *TypeScript*: Tipado estático para JavaScript
- *React Router*: Navegación entre páginas
- *XLSX*: Generación de archivos Excel
- *React-Toastify*: Notificaciones toast
- *CSS Variables*: Temas claro/oscuro
- *Font Awesome*: Iconos
- *Fetch API*: Comunicación con el backend
## Integración con la API

La aplicación se comunica con la API backend mediante servicios dedicados:

```typescript
// Ejemplo de servicio para gestionar aulas
export const getClassroomsByTeacher = async (teacherId: number): Promise<Classroom[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(${API_URL}/classrooms/teacher/${teacherId}, {
      headers: {
        'Authorization': Bearer ${token},
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

## Solución de Problemas Comunes

### Error de Autenticación

1. Verifique que el token JWT esté almacenado correctamente en localStorage
2. Compruebe que el token no haya expirado
3. Intente cerrar sesión y volver a iniciar sesión


### Problemas de Exportación a Excel

1. Verifique que los datos a exportar no sean nulos o indefinidos
2. Compruebe que la estructura de datos sea la esperada por la función de exportación
3. Revise la consola del navegador para ver errores específicos


### Problemas de Visualización

1. Verifique que esté utilizando un navegador compatible
2. Intente borrar la caché del navegador
3. Compruebe que las variables CSS estén correctamente definidas


## Convenciones de Código

- Utilice TypeScript para todos los componentes y servicios
- Siga las convenciones de nomenclatura:

- PascalCase para componentes React
- camelCase para funciones y variables
- kebab-case para archivos CSS



- Documente las funciones y componentes complejos
- Utilice interfaces para definir props y tipos de datos


© 2023 Sistema de Gestión de Asistencia Escolar. Todos los derechos reservados.
thub.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
