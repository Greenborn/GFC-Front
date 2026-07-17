# Documentación de Servicios - Grupo Fotográfico Centro

## Descripción General

Esta documentación describe todos los servicios de la aplicación, organizados por funcionalidad. Los servicios implementan la lógica de negocio y la comunicación con APIs externas usando **Axios** como HTTP client.

## Arquitectura de Servicios

### Jerarquía de Servicios

```
ApiService<T> (Base abstracta - Axios)
├── ContestService
├── UserService
├── ProfileService
├── ImageService
├── FotoclubService
├── ContestResultService
├── ContestRecordService
├── PublicContestService
├── PublicProfileService
├── CreateUserService
├── StadisticsService
├── RankingService
├── InfoCentroService
├── PublicInfoCentroService
├── MetricService
├── MetricAbmService
├── SectionService
├── CategoryService
├── ContestCategoryService
├── ContestSectionService
├── RoleService
├── CompressedPhotosService
├── ProfileContestService
├── ConnectivityService

Servicios independientes (sin ApiService)
├── AuthService
├── SSOAuthService
├── RolificadorService
├── ConfigService
├── ContestResultsService (BehaviorSubject)
├── ConsoleLogService
├── GlobalErrorHandler
├── ResponsiveService
├── ThemeService
├── UiUtilsService
├── ModalService
├── AlertService
├── ToastService
├── LoadingService
```

## Servicio Base (ApiService)

### Descripción
**Archivo**: `src/app/services/api.service.ts`

Servicio base abstracto que proporciona funcionalidad CRUD usando **Axios** en lugar de Angular HttpClient.

### Características
- Operaciones CRUD estándar (GET, POST, PUT, DELETE)
- Manejo de errores centralizado con callback `errorFilter`
- Configurable por recurso (endpoint base)
- Integración con `ConfigService` para URLs de API

### Métodos Principales
```typescript
abstract class ApiService<T> {
  getAll(data?: any): Promise<ApiResponse<T>>
  getById(id: number): Promise<ApiResponse<T>>
  post(data: T): Promise<ApiResponse<T>>
  put(data: T, id: number): Promise<ApiResponse<T>>
  delete(id: number): Promise<ApiResponse<any>>
}
```

### Configuración
```typescript
constructor(
  protected endpoint: string,
  protected config: ConfigService,
  protected uiService?: UiUtilsService,
  protected errorFilter?: (err: any) => string
)
```

### Diferencia clave con Angular HttpClient
Los métodos retornan **Promesas** (vía Axios), no Observables. Los componentes deben usar `async/await` o `.then()`.

## Servicios de Concursos

### ContestService
**Archivo**: `src/app/services/contest.service.ts` - CRUD de concursos (`contest`)

### ContestResultService
**Archivo**: `src/app/services/contest-result.service.ts` - Resultados de concursos (`contest-result`)

### ContestResultsService
**Archivo**: `src/app/services/contest-results.service.ts`

Servicio con estado reactivo usando `BehaviorSubject`. Proporciona:

```typescript
export class ContestResultsService {
  results$: BehaviorSubject<ContestResultExpanded[]>
  get_all(contest_id: number): Promise<void>
}
```

### ContestRecordService
**Archivo**: `src/app/services/contest-record.service.ts` - Registros/documentos de concursos (`contest-record`)

### ContestCategoryService
**Archivo**: `src/app/services/contest-category.service.ts` - Categorías por concurso (`contest-category`)

### ContestSectionService
**Archivo**: `src/app/services/contest-section.service.ts` - Secciones por concurso (`contest-section`)

### PublicContestService
**Archivo**: `src/app/services/public.contest.service.ts` - API pública de concursos (`public-contest`)

## Servicios de Usuarios

### UserService
**Archivo**: `src/app/services/user.service.ts` - CRUD de usuarios (`user`)

### ProfileService
**Archivo**: `src/app/services/profile.service.ts` - CRUD de perfiles (`profile`)

### PublicProfileService
**Archivo**: `src/app/services/public-profile.service.ts` - API pública de perfiles (`public-profile`)

### CreateUserService
**Archivo**: `src/app/services/create-user.service.ts` - Creación de usuarios

### ProfileContestService
**Archivo**: `src/app/services/profile-contest.service.ts` - Relación perfil-concurso

### RoleService
**Archivo**: `src/app/services/role.service.ts` - CRUD de roles (`role`)

## Servicios de Organizaciones

### FotoclubService
**Archivo**: `src/app/services/fotoclub.service.ts` - CRUD de fotoclubs (`fotoclub`)

## Servicios de Imágenes

### ImageService
**Archivo**: `src/app/services/image.service.ts` - CRUD de imágenes (`image`)

### CompressedPhotosService
**Archivo**: `src/app/services/compressed-photos.service.ts` - Descarga comprimida de fotos

## Servicios de Categorización

### SectionService
**Archivo**: `src/app/services/section.service.ts` - CRUD de secciones (`section`)

### CategoryService
**Archivo**: `src/app/services/category.service.ts` - CRUD de categorías (`category`)

### MetricService
**Archivo**: `src/app/services/metric.service.ts` - Consulta de métricas (`metric`)

### MetricAbmService
**Archivo**: `src/app/services/metric-abm.service.ts` - ABM de métricas con diferentes endpoints

## Servicios de Autenticación

### AuthService
**Archivo**: `src/app/modules/auth/services/auth.service.ts`

**Responsabilidad**: Gestión de autenticación y sesión.

```typescript
export class AuthService {
  login(credentials: LoginCredentials): Promise<ApiResponse<UserLogged>>
  logout(): void
  isAuthenticated(): boolean
  getToken(): string | null
  getUserId(): number | null
  getUserRole(): string | null
}
```

Nota: El token y datos de usuario se almacenan en `localStorage`. No se usa Angular HttpClient; el interceptor de Axios en `main.ts` agrega el token automáticamente.

### SSOAuthService
**Archivo**: `src/app/modules/auth/services/sso-auth.service.ts`

Maneja la autenticación vía SSO (Single Sign-On) con `auth.greenborn.com.ar`.

### RolificadorService
**Archivo**: `src/app/modules/auth/services/rolificador.service.ts`

**Responsabilidad**: Gestión de roles y permisos del usuario logueado.

```typescript
export class RolificadorService {
  isAdmin(): boolean
  isJudge(): boolean
  canInsert(): boolean
  canUpdate(): boolean
  canDelete(): boolean
}
```

## Servicios de Estadísticas

### StadisticsService
**Archivo**: `src/app/services/stadistics.service.ts` - Estadísticas del sistema (`stadistics`)

### RankingService
**Archivo**: `src/app/services/ranking.service.ts` - Rankings y clasificaciones

## Servicios de Contenido

### InfoCentroService
**Archivo**: `src/app/services/info-centro.service.ts` - CRUD de contenido del centro (`info-centro`)

### PublicInfoCentroService
**Archivo**: `src/app/services/public.info.centro.service.ts` - API pública de contenido (`public-info-centro`)

## Servicios de Configuración

### ConfigService
**Archivo**: `src/app/services/config/config.service.ts`

**Responsabilidad**: Configuración centralizada de la aplicación. Lee variables de entorno y proporciona:

```typescript
export class ConfigService {
  getApiUrl(): string
  getPublicApi(): string
  getImagesBaseUrl(): string
  getNodeApiBaseUrl(): string
  getAppName(): string
  buildImageUrl(path: string): string  // Con cache busting por timestamp
  getFromStorage(key: string): any
  setToStorage(key: string, value: any): void
}
```

## Servicios de UI

### ResponsiveService
**Archivo**: `src/app/services/ui/responsive.service.ts`

**Responsabilidad**: Detección de dispositivo y responsive design.

```typescript
export class ResponsiveService {
  isMobile(): boolean
  isDesktop(): boolean
}
```

Nota: Usa `window.innerWidth` directamente.

### ThemeService
**Archivo**: `src/app/services/ui/theme.service.ts`

**Responsabilidad**: Cambio entre tema claro y oscuro.

```typescript
export class ThemeService {
  toggleDarkMode(): void
  isDarkMode(): boolean
}
```

### UiUtilsService
**Archivo**: `src/app/services/ui/ui-utils.service.ts`

**Responsabilidad**: Utilidades de interfaz usando Bootstrap y manipulación DOM directa (sin Ionic).

```typescript
export class UiUtilsService {
  mostrarLoading(mensaje?: string): Promise<void>
  ocultarLoading(): Promise<void>
  mostrarError(mensaje: string): Promise<void>
  mostrarAlerta(titulo: string, mensaje: string): Promise<void>
  mostrarToast(mensaje: string): Promise<void>
}
```

### ModalService
**Archivo**: `src/app/services/ui/modal.service.ts`

**Responsabilidad**: Creación dinámica de modales con componentes Angular standalone.

```typescript
export class ModalService {
  createModal<T>(component: Type<T>, props?: Record<string, any>): Promise<any>
  dismissAll(): void
}
```

### AlertService
**Archivo**: `src/app/services/ui/alert.service.ts`

Muestra alertas tipo Bootstrap.

### ToastService
**Archivo**: `src/app/services/ui/toast.service.ts`

Muestra notificaciones toast.

### LoadingService
**Archivo**: `src/app/services/ui/loading.service.ts`

Controla el estado de carga global.

## Servicios de Utilidad

### ConsoleLogService
**Archivo**: `src/app/services/console-log.service.ts`

**Responsabilidad**: Envío de logs del frontend a un endpoint remoto de debug (`debug.greenborn.com.ar`).

```typescript
export class ConsoleLogService {
  sendLog(nivel: string, mensaje: string, datos?: any): Promise<void>
}
```

### GlobalErrorHandler
**Archivo**: `src/app/services/global-error-handler.ts`

**Responsabilidad**: Captura global de errores no manejados. Extiende `ErrorHandler` de Angular.

```typescript
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void
}
```

### ConnectivityService
**Archivo**: `src/app/services/connectivity.service.ts`

**Responsabilidad**: Verificación de conectividad con el servidor.

## Patrones de Uso

### Inyección de Dependencias
```typescript
@Component({ standalone: true, ... })
export class ExampleComponent {
  constructor(
    private contestService: ContestService,
    private authService: AuthService
  ) {}
}
```

### Uso con Promesas (ApiService)
```typescript
async loadData(): Promise<void> {
  try {
    const response = await this.contestService.getAll();
    this.contests = response.items;
  } catch (error) {
    this.uiUtils.mostrarError('Error al cargar datos');
  }
}
```

### Uso con Observables (ContestResultsService)
```typescript
this.contestResultsService.results$
  .pipe(takeUntil(this.unsubscribe$))
  .subscribe(results => {
    this.results = results;
  });
```

### Manejo de Errores
```typescript
// Global: GlobalErrorHandler captura errores no manejados
// Por servicio: ApiService.errorFilter procesa mensajes de error
// Local: try/catch con UiUtilsService.mostrarError()
```

---

*Última actualización: Julio 2026*
