# Documentación de Rutas - Grupo Fotográfico Centro

## Descripción General

Esta documentación describe todas las rutas de la aplicación. La aplicación utiliza **hash-based routing** con **lazy loading** mediante `loadComponent()` (standalone components) y **precarga de todos los módulos** (`PreloadAllModules`).

## Configuración Principal

**Archivo**: `src/app/app-routing.module.ts`

```typescript
export const routes: Routes = [
  // Rutas con lazy loading standalone
  {
    path: 'concursos',
    canActivate: [AuthGuard],
    children: [...]
  },
  // Otras rutas...
];
```

La aplicación se bootstrapa de forma standalone (sin NgModules):

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes, withHashLocation(), withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', { ... }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
});
```

## Rutas de Autenticación

### Login
- **Ruta**: `/login`
- **Componente**: `LoginViewComponent` (lazy)
- **Protección**: Pública
- Descripción: Página de inicio de sesión

### Redirect SSO
- **Ruta**: `/login-redirect`
- **Componente**: `LoginRedirectComponent` (lazy)
- **Protección**: Pública
- Descripción: Manejador de redirect SSO

### Recuperar Contraseña
- **Ruta**: `/recuperar-password`
- **Componente**: `RecuperarPasswordSolicitudComponent` (lazy)
- **Protección**: Pública
- Descripción: Solicitud de recuperación de contraseña

- **Ruta**: `/recuperar-password/codigo`
- **Componente**: `RecuperarPasswordCodigoComponent` (lazy)
- **Protección**: Pública
- Descripción: Ingreso de código de verificación

- **Ruta**: `/recuperar-password/exito`
- **Componente**: `RecuperarPasswordExitoComponent` (lazy)
- **Protección**: Pública
- Descripción: Confirmación de contraseña restablecida

## Rutas de Concursos (Protegidas: AuthGuard)

### Lista de Concursos
- **Ruta**: `/concursos`
- **Componente**: `ConcursosPage` (lazy)
- Descripción: Lista de todos los concursos con filtros

### Crear Concurso
- **Ruta**: `/concursos/nuevo`
- **Componente**: `ConcursoPostPage` (lazy)
- Descripción: Formulario para crear nuevo concurso

### Editar Concurso
- **Ruta**: `/concursos/editar/:id`
- **Componente**: `ConcursoPostPage` (lazy)
- **Parámetros**: `id` (ID del concurso)
- Descripción: Formulario para editar concurso existente

### Detalle de Concurso
- **Ruta**: `/concursos/:id`
- **Componente**: `ConcursoDetailPage` (lazy, padre con tabs)
- **Parámetros**: `id` (ID del concurso)
- Redirección por defecto: `informacion`

#### Subrutas (child routes)
- `/concursos/:id/informacion` → `InformacionComponent`
- `/concursos/:id/concursantes` → `ConcursantesComponent`
- `/concursos/:id/fotografias` → `FotografiasComponent`

### Secciones ABM
- **Ruta**: `/concursos/secciones`
- **Componente**: `SeccionesAbmPage` (lazy)
- Descripción: Administración de secciones

### Métricas ABM
- **Ruta**: `/concursos/metricas`
- **Componente**: `MetricasAbmPage` (lazy)
- Descripción: Administración de métricas de evaluación

### Ranking
- **Ruta**: `/concursos/ranking`
- **Componente**: `RankingPage` (lazy)
- Descripción: Ranking de participantes con detalle modal

## Rutas de Usuarios

### Perfil de Usuario (protegido)
- **Ruta**: `/perfil/:id`
- **Componente**: `PerfilPage` (lazy)
- **Protección**: AuthGuard
- **Parámetros**: `id` (ID del usuario)

### Editar Perfil (protegido)
- **Ruta**: `/perfil/editar`
- **Componente**: `UsuarioPage` (lazy)
- **Protección**: AuthGuard

### Administración de Usuarios (protegido)
- **Ruta**: `/usuarios`
- **Componente**: `UsuariosAbmPage` (lazy)
- **Protección**: AuthGuard

### Crear Usuario (protegido)
- **Ruta**: `/usuarios/nuevo`
- **Componente**: `UsuarioPostPage` (lazy)
- **Protección**: AuthGuard

### Editar Usuario (protegido)
- **Ruta**: `/usuarios/editar/:id`
- **Componente**: `UsuarioPostPage` (lazy)
- **Protección**: AuthGuard

### Registro (público)
- **Ruta**: `/registro`
- **Componente**: `UsuarioPostPage` (lazy)
- **Protección**: Pública

## Rutas de Herramientas (Protegidas: AuthGuard)

### Herramientas
- **Ruta**: `/herramientas`
- **Componente**: `HerramientasPage` (lazy)
- Descripción: Panel de herramientas administrativas

### Búsqueda de Fotografías
- **Ruta**: `/herramientas/busqueda-fotografias`
- **Componente**: `BusquedaFotografiasPage` (lazy)
- Descripción: Búsqueda avanzada de fotografías

### Carga de Resultados
- **Ruta**: `/herramientas/carga-resultados`
- **Componente**: `CargaResultadosPage` (lazy)
- Descripción: Importación de resultados desde Excel

## Página Principal (Pública)
- **Ruta**: `/`
- **Componente**: `InfoCentroPage` (lazy)
- Descripción: Página principal con información del centro

## Organizaciones (Pública)
- **Ruta**: `/organizaciones`
- **Componente**: `FotoclubsAbmPage` (lazy)
- Descripción: Lista de organizaciones/fotoclubs

## Notificaciones (Protegida)
- **Ruta**: `/notificaciones`
- **Componente**: `NotificacionesPage` (lazy)
- **Protección**: AuthGuard

## Páginas Legales
- **Ruta**: `/politica-privacidad`
- **Componente**: `PoliticaPrivacidadComponent` (eager, standalone)
- **Protección**: Pública

- **Ruta**: `/condiciones-servicio`
- **Componente**: `CondicionesServicioComponent` (eager, standalone)
- **Protección**: Pública

## Rutas Legacy
- **Ruta**: `/folder/:id`
- **Componente**: `FolderPage` (lazy)
- **Protección**: Pública (no requiere auth)
- Descripción: Ruta del sistema (legacy, del template original Ionic)

## Protección de Rutas

### AuthGuard
**Archivo**: `src/app/modules/auth/guards/auth.guard.ts`

El `AuthGuard` protege las rutas que requieren autenticación. Verifica que el usuario tenga un token JWT válido en localStorage.

### Rutas Protegidas
- `/concursos/*` (excepto `/concursos/ranking` y `/concursos/secciones` que también requieren auth)
- `/perfil/*`
- `/usuarios/*`
- `/notificaciones`
- `/herramientas/*`

### Rutas Públicas
- `/` (página principal)
- `/login`
- `/login-redirect`
- `/registro`
- `/organizaciones`
- `/recuperar-password/*`
- `/politica-privacidad`
- `/condiciones-servicio`
- `/folder/:id`

## Interceptor HTTP (Axios)
**Archivo**: `src/main.ts`

No se usa `HttpInterceptor` de Angular. Se utiliza un **Axios request interceptor** que agrega automáticamente:
- Bearer token desde localStorage
- `unique_id` de SSO como query param

```typescript
axios.interceptors.request.use(config => {
  if (config.url?.startsWith(API_BASE_URL)) {
    const token = localStorage.getItem(tokenKey);
    if (token) config.headers.Authorization = 'Bearer ' + token;
    const uniqueId = localStorage.getItem('sso_client_unique_id');
    if (uniqueId) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url += separator + 'unique_id=' + encodeURIComponent(uniqueId);
    }
  }
  return config;
});
```

## Mapa Completo de Rutas

```
/  (InfoCentroPage)
├── login (LoginViewComponent)
├── login-redirect (LoginRedirectComponent)
├── registro (UsuarioPostPage)
├── recuperar-password/
│   ├── (RecuperarPasswordSolicitudComponent)
│   ├── codigo (RecuperarPasswordCodigoComponent)
│   └── exito (RecuperarPasswordExitoComponent)
├── concursos/ (AuthGuard)
│   ├── (ConcursosPage)
│   ├── nuevo (ConcursoPostPage)
│   ├── editar/:id (ConcursoPostPage)
│   ├── :id/ (ConcursoDetailPage)
│   │   ├── informacion (InformacionComponent) [default]
│   │   ├── concursantes (ConcursantesComponent)
│   │   └── fotografias (FotografiasComponent)
│   ├── secciones (SeccionesAbmPage)
│   ├── metricas (MetricasAbmPage)
│   └── ranking (RankingPage)
├── perfil/
│   ├── :id (PerfilPage)
│   └── editar (UsuarioPage)
├── usuarios/ (AuthGuard)
│   ├── (UsuariosAbmPage)
│   ├── nuevo (UsuarioPostPage)
│   └── editar/:id (UsuarioPostPage)
├── herramientas/ (AuthGuard)
│   ├── (HerramientasPage)
│   ├── busqueda-fotografias (BusquedaFotografiasPage)
│   └── carga-resultados (CargaResultadosPage)
├── notificaciones (NotificacionesPage) [AuthGuard]
├── organizaciones (FotoclubsAbmPage)
├── politica-privacidad (PoliticaPrivacidadComponent)
├── condiciones-servicio (CondicionesServicioComponent)
└── folder/:id (FolderPage)
```

### Tabla de Rutas Completa

| Ruta | Componente | Carga | Protección |
|------|-----------|-------|-----------|
| `/` | InfoCentroPage | lazy | Pública |
| `/login` | LoginViewComponent | lazy | Pública |
| `/login-redirect` | LoginRedirectComponent | lazy | Pública |
| `/registro` | UsuarioPostPage | lazy | Pública |
| `/recuperar-password` | RecuperarPasswordSolicitudComponent | lazy | Pública |
| `/recuperar-password/codigo` | RecuperarPasswordCodigoComponent | lazy | Pública |
| `/recuperar-password/exito` | RecuperarPasswordExitoComponent | lazy | Pública |
| `/concursos` | ConcursosPage | lazy | AuthGuard |
| `/concursos/nuevo` | ConcursoPostPage | lazy | AuthGuard |
| `/concursos/editar/:id` | ConcursoPostPage | lazy | AuthGuard |
| `/concursos/:id` | ConcursoDetailPage | lazy | AuthGuard |
| `/concursos/:id/informacion` | InformacionComponent | lazy | AuthGuard |
| `/concursos/:id/concursantes` | ConcursantesComponent | lazy | AuthGuard |
| `/concursos/:id/fotografias` | FotografiasComponent | lazy | AuthGuard |
| `/concursos/secciones` | SeccionesAbmPage | lazy | AuthGuard |
| `/concursos/metricas` | MetricasAbmPage | lazy | AuthGuard |
| `/concursos/ranking` | RankingPage | lazy | AuthGuard |
| `/perfil/:id` | PerfilPage | lazy | AuthGuard |
| `/perfil/editar` | UsuarioPage | lazy | AuthGuard |
| `/usuarios` | UsuariosAbmPage | lazy | AuthGuard |
| `/usuarios/nuevo` | UsuarioPostPage | lazy | AuthGuard |
| `/usuarios/editar/:id` | UsuarioPostPage | lazy | AuthGuard |
| `/herramientas` | HerramientasPage | lazy | AuthGuard |
| `/herramientas/busqueda-fotografias` | BusquedaFotografiasPage | lazy | AuthGuard |
| `/herramientas/carga-resultados` | CargaResultadosPage | lazy | AuthGuard |
| `/notificaciones` | NotificacionesPage | lazy | AuthGuard |
| `/organizaciones` | FotoclubsAbmPage | lazy | Pública |
| `/politica-privacidad` | PoliticaPrivacidadComponent | eager | Pública |
| `/condiciones-servicio` | CondicionesServicioComponent | eager | Pública |
| `/folder/:id` | FolderPage | lazy | Pública |

---

*Última actualización: Julio 2026*
