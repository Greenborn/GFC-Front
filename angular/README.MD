# Grupo Fotográfico Centro - Frontend

Aplicación web frontend para la gestión de concursos fotográficos del Grupo Fotográfico Centro. Desarrollada con **Angular 21** y **Bootstrap 5**.

## Descripción

Esta aplicación permite la gestión completa de concursos fotográficos, incluyendo:
- Gestión de concursos y participantes
- Sistema de inscripciones y juzgamiento
- Administración de usuarios y organizaciones
- Galería de fotografías con búsqueda
- Sistema de notificaciones
- Panel de administración
- PWA con service worker

## Tecnologías

- **Framework**: Angular 21.2.18 (Standalone Components)
- **UI Framework**: Bootstrap 5.3.3 + Bootstrap Icons
- **Lenguaje**: TypeScript ~5.9.3
- **Estado**: RxJS 7.5.0 (BehaviorSubject, Subjects)
- **HTTP Client**: Axios 1.18.1
- **Build Tool**: Angular CLI 21.2.19
- **PWA**: @angular/service-worker
- **Linting**: ESLint + Angular ESLint 21.4.0

## Instalación

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd GFC-Front/angular
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar y editar archivo de configuración
cp config.env .env
# Editar .env según tu entorno
```

4. **Ejecutar en modo desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Scripts disponibles

```bash
# Generar variables de entorno desde .env
npm run generate-env

# Desarrollo
npm start                    # Inicia el servidor de desarrollo

# Build producción
npm run build               # Construye para producción y genera .zip

# Linting
npm run lint                # Ejecuta ESLint

# Actualizar versión
npm run update-version      # Actualiza versión en package.json y environments
```

## Estructura del Proyecto

```
angular/src/
├── app/
│   ├── concursos/           # Gestión de concursos
│   │   ├── concurso-detail/ # Detalle con tabs (info, participantes, fotos)
│   │   ├── concurso-post/   # Crear/editar concurso
│   │   ├── ranking/         # Ranking de participantes
│   │   ├── secciones-abm/   # ABM de secciones
│   │   ├── metricas-abm/    # ABM de métricas
│   │   └── fotos-anio-card/ # Card de foto del año
│   ├── usuario/             # Perfiles y ABM de usuarios
│   ├── modules/auth/        # Autenticación (login, SSO, password recovery)
│   ├── shared/              # Componentes reutilizables
│   ├── services/            # Servicios (API, UI, config)
│   ├── models/              # Interfaces TypeScript
│   ├── nav/                 # Navbar y Sidebar
│   ├── info-centro/         # Página principal del centro
│   ├── fotoclubs-abm/       # ABM de organizaciones
│   ├── herramientas/        # Búsqueda de fotos, carga de resultados
│   ├── notificaciones/      # Centro de notificaciones
│   ├── condiciones-servicio/   # Términos legales
│   └── politica-privacidad/    # Política de privacidad
├── assets/                  # Recursos estáticos (iconos, imágenes)
├── environments/            # Configuración de entorno (auto-generado)
└── theme/                   # Variables CSS y estilos globales
```

## Documentación

La documentación completa del proyecto se encuentra en el directorio `documentacion/`:

- [Arquitectura](../documentacion/arquitectura.md) - Descripción de la arquitectura del sistema
- [Componentes](../documentacion/componentes.md) - Documentación de todos los componentes
- [Rutas](../documentacion/rutas.md) - Mapeo completo de rutas y navegación
- [Servicios](../documentacion/servicios.md) - Documentación de servicios y APIs
- [Modelos](../documentacion/modelos.md) - Definición de modelos de datos

## Configuración

### Variables de Entorno

Las variables de entorno se configuran en `config.env` (equipo) o `.env` (personal):

```bash
API_BASE_URL=https://gfc.prod-api.greenborn.com.ar/
IMAGES_BASE_URL=https://assets.prod-gfc.greenborn.com.ar
NODE_API_BASE_URL=https://gfc.api2.greenborn.com.ar/api/
LOGIN_ACTION=login
APP_NAME=app_gfc_prod-
APP_VERSION=1.19.50
```

## Build para Producción

```bash
npm run build
# Genera build/ + gfc_build.zip
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT

## Autores

- **Greenborn** - *Desarrollo inicial* - [Greenborn](https://greenborn.com.ar)

## Soporte

Para soporte técnico o consultas, contactar a través de:
- Sitio web: [https://greenborn.com.ar](https://greenborn.com.ar)

---

## Change Log

### **1.19.50** (Julio 2026)
- Refactor a standalone components (sin NgModules)
- Migración de Ionic 6 a Bootstrap 5
- Angular 12 → Angular 21
- TypeScript 4.2.4 → 5.9.3
- Nuevo sistema de autenticación SSO
- PWA con service worker
- Ranking con detalle modal
- Búsqueda de fotografías
- Carga de resultados desde Excel
- Tema oscuro/claro con transiciones suaves

### **1.10.16** (Octubre 2025)
- Actualización de dependencias críticas
- Mejoras en la seguridad del sistema
- Optimizaciones de rendimiento
- Correcciones de bugs menores

### **1.1.31**
- Edición de campo fotoclub / organización nuevamente funcional
- Se corrige ancho de selectores de filtros en vista de fotografías

### **1.1.29**
- Solución a error que impedía la actualización del perfil personal
- Mejoras en mensajes de error
- Correcciones en formularios de edición

### **1.1.26**
- Se corrige bug por el cual se mostraba botón de inscripción en concursos cerrados
- Se corrige bug que excluía algunos resultados de los filtros

### **1.1.24**
- Se modifica visibilidad de botón de galería de imágenes en listado de concursantes

### **1.1.23**
- Modificación en visibilidad de nombre de concursante

### **1.1.22**
- Bug resuelto: Cuando un concurso está abierto no se muestra nombre de autor

### **1.1.21**
- En vista de detalle de imagen, se mueve de posición botón de cerrar modal

### **1.1.20**
- Se quita margen excesivo en móviles
- Se cambia título de modal de detalle de imagen a uno genérico

### **1.1.19**
- Mejora en visualización de galería: se limita ancho máximo de textos
- Mejora en vista de detalle de imagen, se cambia los controles de navegación

### **1.1.18**
- Se arregla visualización de detalle de imagen en desktop
- Se arregla definición de horario al definir o modificar un concurso

### **1.1.17**
- Se soluciona bug que cerraba sesión en vista móvil al querer editar perfil
- Se mejora presentación de galería

### **1.1.16**
- Mejora en vista de detalles de fotografía

### **1.1.15**
- Vista de fotografías en formato galería

### **1.0.15**
- Orden alfabético en selector de organizaciones
- Modificación de etiqueta de selector de organización
- Corrección en textos de botones de selectores
- Corrección a error en botonera de acciones sobre fotografías

### **1.0.13**
- Corrección lang
- Se aumenta límite de tamaño de fotografías

### **1.0.12**
- Se formatean fechas de concurso para asegurarse de que siempre se vea en el formato correcto

### **1.0.2**
- Se agrega botón para descarga de archivo comprimido de fotografías
