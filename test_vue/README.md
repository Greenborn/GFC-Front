# GFC Vue.js App

Aplicación Vue.js que replica la funcionalidad del proyecto Angular GFC (Grupo Fotográfico).

## Características

- **Vue 3** con Composition API
- **Bootstrap 5** para componentes UI
- **Axios** para peticiones HTTP
- **Vue Router** para navegación
- **Vite** como bundler

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env .env
# Editar .env con las configuraciones necesarias
```

## Variables de Entorno

Crear archivo `.env` con:

```env
VITE_API_BASE_URL=https://gfc.prod-api.greenborn.com.ar/
VITE_LOGIN_ACTION=login
VITE_APP_NAME=app_gfc_prod-
VITE_VERSION=1.1.32
```

## Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

## Build

```bash
# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── views/              # Vistas de la aplicación
│   ├── concursos/      # Vistas relacionadas con concursos
│   ├── usuario/        # Vistas de usuarios
│   └── fotoclubs/      # Vistas de organizaciones
├── services/           # Servicios de API
├── router/             # Configuración de rutas
├── assets/             # Recursos estáticos
└── utils/              # Utilidades
```

## Funcionalidades Implementadas

- ✅ Autenticación y autorización
- ✅ Gestión de concursos (CRUD)
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de organizaciones fotográficas
- ✅ Gestión de categorías y secciones
- ✅ Sistema de notificaciones
- ✅ Rankings y estadísticas
- ✅ Perfiles de usuario

## Tecnologías Utilizadas

- **Vue 3**: Framework principal
- **Composition API**: API de composición de Vue 3
- **Bootstrap 5**: Framework CSS
- **Axios**: Cliente HTTP
- **Vue Router**: Enrutamiento
- **Vite**: Bundler y dev server

## Scripts Disponibles

- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run preview`: Previsualizar build
- `npm run serve`: Servir build de producción

## Notas

- La aplicación usa hash routing (`#`) para compatibilidad con el proyecto Angular original
- Los assets y estilos son compatibles con el proyecto Angular
- La configuración de API es idéntica al proyecto original 