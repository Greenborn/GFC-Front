# Arquitectura del Sistema - Grupo Fotográfico Centro

## Descripción General

La aplicación del Grupo Fotográfico Centro es una **SPA** (Single Page Application) desarrollada con **Angular 21** (Standalone Components) y **Bootstrap 5**, diseñada para la gestión completa de concursos fotográficos. Sigue principios de modularidad, separación de responsabilidades y escalabilidad.

## Arquitectura General

### Patrón de Arquitectura
La aplicación utiliza componentes **standalone** de Angular (sin NgModules), siguiendo una arquitectura de capas:

- **Model**: Interfaces TypeScript en `models/`
- **View**: Componentes standalone Angular + Bootstrap
- **Controller/Service**: Lógica de negocio en servicios inyectables

### Capas de la Aplicación

```
┌─────────────────────────────────────┐
│           PRESENTACIÓN              │
│  (Componentes Angular + Bootstrap)  │
├─────────────────────────────────────┤
│           LÓGICA DE NEGOCIO         │
│        (Servicios Angular)          │
├─────────────────────────────────────┤
│           ACCESO A DATOS            │
│   (ApiService abstracto + Axios)    │
├─────────────────────────────────────┤
│           COMUNICACIÓN              │
│     (Axios HTTP Client)             │
└─────────────────────────────────────┘
```

## Estructura de Módulos (Standalone)

La aplicación usa **standalone components** con **lazy loading** mediante `loadComponent()`. No hay NgModules.

### Áreas funcionales:

#### 1. **AppComponent** (Raíz)
- Bootstrap manual: `bootstrapApplication(AppComponent, { providers: [...] })`
- Layout: Navbar + Sidebar + RouterOutlet
- Servicios globales: GlobalErrorHandler, Axios interceptor

#### 2. **Auth** (Autenticación)
- Componentes: LoginView, LoginRedirect, RecuperarPassword*
- Servicios: AuthService, SSOAuthService, RolificadorService
- Guards: AuthGuard
- Validadores: PasswordValidator

#### 3. **Concursos** (Gestión de Concursos)
- Páginas: ConcursosPage, ConcursoPostPage, ConcursoDetailPage
- Detail children: InformacionComponent, ConcursantesComponent, FotografiasComponent
- ABM: SeccionesAbmPage, MetricasAbmPage
- Ranking: RankingPage, RankingDetalleModalComponent
- Imágenes: ImagePostPage, ImageReviewPage
- Registros: ContestRecordsComponent, ContestRecordFormComponent

#### 4. **Usuario** (Gestión de Usuarios)
- Perfil: PerfilPage, UsuarioPage
- ABM: UsuariosAbmPage, UsuarioPostPage
- Componentes: ChangePasswordComponent, ConfirmUserComponent

#### 5. **InfoCentro** (Información del Centro)
- Página principal: InfoCentroPage
- Componentes: InfoCentroPostComponent, PresentacionComisionDirectivaComponent, PresentacionMiembrosComponent, PresentacionUltimoConcursoComponent

#### 6. **FotoclubsAbm** (Organizaciones)
- Páginas: FotoclubsAbmPage, FotoclubPostComponent

#### 7. **Herramientas**
- HerramientasPage, BusquedaFotografiasPage, CargaResultadosPage

#### 8. **Shared** (Componentes Compartidos)
- UsuarioImgComponent, SearchBarComponent, MenuAccionesComponent, InputOjoComponent
- BtnSortComponent, ThSortComponent, BtnPostComponent, SearchableSelectComponent
- SlidesComponent, InfiniteScrollDirective

## Flujo de Datos

### 1. Autenticación
```
Usuario → LoginViewComponent → AuthService → API → Token → localStorage
```

### 2. CRUD
```
Componente → Service → ApiService (Axios) → API → Backend
```

### 3. Estado Reactivo (ContestResultsService)
```
Componente → ContestResultsService.get_all() → BehaviorSubject → Componente (suscrito)
```

### 4. Navegación
```
Router → AuthGuard → loadComponent() → Componente → Service → API
```

## Seguridad

### Autenticación
- **JWT Tokens**: Almacenados en localStorage
- **Interceptor Axios**: Inyección automática de Bearer token
- **SSO**: Integración con `auth.greenborn.com.ar`
- **Guards**: AuthGuard protege rutas

### Autorización
- **Sistema de Roles**: Admin, User, Juez (vía RolificadorService)
- **Permisos**: Control de acceso basado en rol_id

## Responsive Design

- **Framework**: Bootstrap 5 (grid system, breakpoints, utilidades responsive)
- **Sidebar**: Toggle para vista móvil
- **Breakpoints de Bootstrap**: sm (≥576px), md (≥768px), lg (≥992px), xl (≥1200px)

## Configuración y Entornos

### Variables de Entorno
```typescript
export const environment = {
  production: false,
  version: '1.19.51',
  apiBaseUrl: 'https://gfc.prod-api.greenborn.com.ar/',
  publicApi: 'https://gfc.api2.greenborn.com.ar/api/',
  loginAction: 'login',
  appName: 'app_gfc_prod-',
  imagesBaseUrl: 'https://assets.prod-gfc.greenborn.com.ar',
  nodeApiBaseUrl: 'https://gfc.api2.greenborn.com.ar/api/',
  ssoBaseUrl: 'https://auth.greenborn.com.ar',
  ssoRedirect: '/#/login-redirect'
};
```

Las variables se generan automáticamente desde `config.env` o `.env` mediante `scripts/generate-env.js`.

## PWA

- Service Worker configurado con `@angular/service-worker` y `ngsw-config.json`
- Precarga de app shell (CSS, JS)
- Carga lazy de assets
- Estrategia: `registerWhenStable:3000`

## Rendimiento

### Optimizaciones Implementadas
- **Lazy Loading**: `loadComponent()` para todas las rutas
- **Preloading**: `PreloadAllModules` para precarga de rutas
- **Unsubscribe Pattern**: `takeUntil(this.unsubscribe$)` en suscripciones RxJS

### Por implementar
- `ChangeDetectionStrategy.OnPush` en componentes
- `trackBy` en `*ngFor`
- Caching de localStorage en AuthService

## Estado de la Aplicación

### Gestión de Estado
- **Local State**: Variables de instancia en componentes
- **Service State**: BehaviorSubject en servicios (ej: ContestResultsService)
- **RxJS**: Observables y Subjects para flujos reactivos
- **localStorage**: Token JWT, datos de usuario, preferencia de tema

## Monitoreo y Logging

### Estrategia de Logging
- **ConsoleLogService**: Envío remoto de errores a `debug.greenborn.com.ar`
- **GlobalErrorHandler**: Captura global de errores no manejados
- **console.error interceptor**: Redirección de console.error al servicio remoto

## Dependencias Principales

### Core Dependencies
- **Angular**: 21.2.18
- **Bootstrap**: 5.3.3 + Bootstrap Icons
- **RxJS**: 7.5.0
- **Axios**: 1.18.1
- **TypeScript**: 5.9.3
- **xlsx**: 0.18.5 (carga de resultados Excel)

### Dev Dependencies
- **Angular CLI**: 21.2.19
- **ESLint**: 8.x + Angular ESLint 21.4.0
- **TypeScript**: 5.9.3

---

*Última actualización: Julio 2026*
