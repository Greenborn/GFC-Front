# Documentación del Sistema - Grupo Fotográfico Centro

## Descripción General

Esta documentación describe el sistema GFC (Grupo Fotográfico Centro): una **SPA Angular 21** con **Bootstrap 5**, **standalone components** y **lazy loading**.

## Índice de Documentación

### [Arquitectura](./arquitectura.md)
Descripción de la arquitectura del sistema:
- Standalone components vs NgModules
- Capas de aplicación
- Flujo de datos
- Seguridad y autenticación JWT/SSO
- Configuración y entornos
- PWA con service worker

### [Componentes](./componentes.md)
Todos los componentes standalone:
- **Auth**: Login, SSO redirect, recuperar contraseña
- **Concursos**: Lista, detalle (tabs), post, ranking, ABMs
- **Usuario**: Perfil, ABM, cambio de contraseña
- **InfoCentro**: Home, comisión, miembros
- **FotoclubsAbm**: Organizaciones
- **Herramientas**: Búsqueda fotos, carga resultados
- **Shared**: SearchBar, MenuAcciones, InputOjo, Slides, etc.

### [Rutas](./rutas.md)
Mapeo completo de rutas:
- 29 rutas con lazy loading (`loadComponent`)
- Hash-based routing
- AuthGuard para rutas protegidas
- PreloadAllModules

### [Servicios](./servicios.md)
Todos los servicios:
- **ApiService**: Base CRUD con Axios
- **Servicios de negocio**: ContestService, UserService, ImageService, etc.
- **UI**: ModalService, ToastService, ThemeService, etc.
- **Infraestructura**: ConfigService, ConsoleLogService, GlobalErrorHandler

### [Modelos](./modelos.md)
Interfaces TypeScript:
- User, Profile, Contest, Image, Fotoclub
- ApiRequest/ApiResponse
- Enums (UserRole, ContestStatus)

### [Guías de Desarrollo](./guias-desarrollo.md)
Setup y convenciones:
- Angular 21 + Bootstrap 5
- Patrones: Promesas (ApiService) + Observables (RxJS)
- Variables de entorno

### [Proceso de Importación de Resultados](./proceso-importacion-resultados.md)
Importación masiva desde Excel:
- Flujo: selección → validación → envío
- Estructura de directorios
- Validaciones y endpoint

## Inicio Rápido

### Para Desarrolladores Nuevos
1. **Leer [Arquitectura](./arquitectura.md)** para entender la estructura
2. **Revisar [Componentes](./componentes.md)** para la UI
3. **Explorar [Rutas](./rutas.md)** para navegación
4. **Estudiar [Servicios](./servicios.md)** para lógica de negocio
5. **Consultar [Modelos](./modelos.md)** para estructuras de datos

### Setup local
```bash
cd angular
cp config.env .env      # Configurar variables
npm install
npm start               # http://localhost:4200
```

## Documentación Desactualizada

Los siguientes archivos contienen referencias a versiones anteriores (Angular 12, Ionic 6, módulos NgModules) y **no reflejan el estado actual**:

- [Especificación Universal](./especificacion-universal.md) - Desactualizada (ref. Angular 12 + Ionic 6)
- [Análisis de Dependencias](./analisis-dependencias.md) - Desactualizado (ref. Angular 12-18)
- [Resumen Actualización Oct 2025](./resumen-actualizacion-oct-2025.md) - Histórico
- [Informe Completo Revisión](./INFORME-COMPLETO-REVISION-OCT-2025.md) - Histórico

## Recursos

### Tecnologías actuales
- [Angular 21](https://angular.dev/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [RxJS](https://rxjs.dev/)
- [Axios](https://axios-http.com/)

### Repositorio
- [GFC-Front](../angular/README.MD)

---

**Última actualización**: Julio 2026  
**Versión**: 1.19.50
