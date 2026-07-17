# Documentación de Servicios - Grupo Fotográfico Centro

## 📋 Descripción General

Esta documentación describe todos los servicios de la aplicación, organizados por funcionalidad y responsabilidad. Los servicios implementan la lógica de negocio y la comunicación con APIs externas.

## 🏗️ Arquitectura de Servicios

### Jerarquía de Servicios
```
ApiService (Base)
├── ContestService
├── UserService
├── ProfileService
├── ImageService
├── AuthService
├── FotoclubService
└── Otros servicios específicos
```

### Patrón de Diseño
La aplicación utiliza el patrón **Service Layer** para separar la lógica de negocio de los componentes:

```typescript
// Ejemplo de estructura de servicio
@Injectable({
  providedIn: 'root'
})
export class ExampleService extends ApiService<ExampleModel> {
  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super('example-resource', http, config);
  }
}
```

## 🔧 Servicio Base (ApiService)

### Descripción
**Archivo**: `src/app/services/api.service.ts`

Servicio base que proporciona funcionalidad CRUD común para todos los servicios de la aplicación.

### Características
- Operaciones CRUD estándar (GET, POST, PUT, DELETE)
- Manejo de errores centralizado
- Cache de datos
- Interceptores HTTP
- Gestión de estado de carga

### Métodos Principales
```typescript
abstract class ApiService<T> {
  // Obtener todos los elementos
  getAll(): Observable<T[]>
  
  // Obtener elemento por ID
  getById(id: number): Observable<T>
  
  // Crear nuevo elemento
  post(data: T): Observable<T>
  
  // Actualizar elemento
  put(data: T, id: number): Observable<T>
  
  // Eliminar elemento
  delete(id: number): Observable<any>
  
  // Búsqueda personalizada
  search(params: any): Observable<T[]>
}
```

### Configuración
```typescript
// Configuración del servicio base
protected fetchAllOnce: boolean = false; // Cache de datos
protected all: any[]; // Datos en memoria
all_meta: any; // Metadatos de respuesta
```

## 🏆 Servicios de Concursos

### ContestService
**Archivo**: `src/app/services/contest.service.ts`

**Responsabilidad**: Gestión completa de concursos fotográficos.

**Métodos Específicos**:
```typescript
export class ContestService extends ApiService<Contest> {
  // Obtener concursos expandidos con relaciones
  getExpanded(): Observable<ContestExpanded[]>
  
  // Obtener concurso por ID con datos expandidos
  getExpandedById(id: number): Observable<ContestExpanded>
  
  // Obtener concursos activos
  getActiveContests(): Observable<Contest[]>
  
  // Obtener concursos por estado
  getContestsByStatus(status: string): Observable<Contest[]>
  
  // Obtener estadísticas de concurso
  getContestStats(contestId: number): Observable<any>
}
```

**Uso**:
```typescript
// En componente
constructor(private contestService: ContestService) {}

loadContests(): void {
  this.contestService.getAll().subscribe(
    contests => this.contests = contests,
    error => console.error('Error loading contests:', error)
  );
}
```

### ContestResultService
**Archivo**: `src/app/services/contest-result.service.ts`

**Responsabilidad**: Gestión de resultados de concursos.

**Métodos**:
```typescript
export class ContestResultService extends ApiService<ContestResult> {
  // Obtener resultados por concurso
  getByContest(contestId: number): Observable<ContestResult[]>
  
  // Obtener resultados por imagen
  getByImage(imageId: number): Observable<ContestResult[]>
  
  // Obtener resultados expandidos
  getExpanded(): Observable<ContestResultExpanded[]>
  
  // Calcular puntuación total
  calculateTotalScore(contestId: number): Observable<any>
}
```

### ContestRecordService
**Archivo**: `src/app/services/contest-record.service.ts`

**Responsabilidad**: Gestión de registros y documentos de concursos.

**Métodos**:
```typescript
export class ContestRecordService extends ApiService<ContestRecord> {
  // Obtener registros por concurso
  getByContest(contestId: number): Observable<ContestRecord[]>
  
  // Subir documento
  uploadDocument(file: File, contestId: number): Observable<ContestRecord>
  
  // Descargar documento
  downloadDocument(recordId: number): Observable<Blob>
}
```

### PublicContestService
**Archivo**: `src/app/services/public.contest.service.ts`

**Responsabilidad**: Acceso público a información de concursos.

**Métodos**:
```typescript
export class PublicContestService extends ApiService<Contest> {
  // Obtener concursos públicos
  getPublicContests(): Observable<Contest[]>
  
  // Obtener concurso público por ID
  getPublicContestById(id: number): Observable<Contest>
}
```

## 👤 Servicios de Usuarios

### UserService
**Archivo**: `src/app/services/user.service.ts`

**Responsabilidad**: Gestión de usuarios del sistema.

**Métodos Específicos**:
```typescript
export class UserService extends ApiService<User> {
  // Cambiar contraseña
  changePassword(params: ApiChangePasswordBody, userId: number): Observable<any>
  
  // Obtener usuario actual
  getCurrentUser(): Observable<UserLogged>
  
  // Verificar si usuario existe
  checkUserExists(username: string): Observable<boolean>
  
  // Obtener usuarios por rol
  getUsersByRole(roleId: number): Observable<User[]>
}
```

### ProfileService
**Archivo**: `src/app/services/profile.service.ts`

**Responsabilidad**: Gestión de perfiles de usuario.

**Métodos**:
```typescript
export class ProfileService extends ApiService<Profile> {
  // Obtener perfil expandido
  getExpanded(): Observable<ProfileExpanded[]>
  
  // Obtener perfil por ID expandido
  getExpandedById(id: number): Observable<ProfileExpanded>
  
  // Obtener perfiles por fotoclub
  getByFotoclub(fotoclubId: number): Observable<Profile[]>
  
  // Actualizar imagen de perfil
  updateProfileImage(profileId: number, imageFile: File): Observable<Profile>
}
```

### PublicProfileService
**Archivo**: `src/app/services/public-profile.service.ts`

**Responsabilidad**: Acceso público a perfiles de usuario.

**Métodos**:
```typescript
export class PublicProfileService extends ApiService<Profile> {
  // Obtener perfiles públicos
  getPublicProfiles(): Observable<Profile[]>
  
  // Obtener perfil público por ID
  getPublicProfileById(id: number): Observable<Profile>
}
```

### CreateUserService
**Archivo**: `src/app/services/create-user.service.ts`

**Responsabilidad**: Creación de nuevos usuarios.

**Métodos**:
```typescript
export class CreateUserService extends ApiService<User> {
  // Registrar nuevo usuario
  registerUser(userData: any): Observable<User>
  
  // Verificar disponibilidad de username
  checkUsernameAvailability(username: string): Observable<boolean>
  
  // Enviar email de confirmación
  sendConfirmationEmail(email: string): Observable<any>
}
```

## 🏢 Servicios de Organizaciones

### FotoclubService
**Archivo**: `src/app/services/fotoclub.service.ts`

**Responsabilidad**: Gestión de organizaciones/fotoclubs.

**Métodos**:
```typescript
export class FotoclubService extends ApiService<Fotoclub> {
  // Obtener fotoclubs con estadísticas
  getWithStats(): Observable<Fotoclub[]>
  
  // Obtener fotoclub por ID con estadísticas
  getWithStatsById(id: number): Observable<Fotoclub>
  
  // Buscar fotoclubs por nombre
  searchByName(name: string): Observable<Fotoclub[]>
  
  // Obtener miembros de fotoclub
  getMembers(fotoclubId: number): Observable<Profile[]>
}
```

## 📸 Servicios de Imágenes

### ImageService
**Archivo**: `src/app/services/image.service.ts`

**Responsabilidad**: Gestión de fotografías y archivos multimedia.

**Métodos**:
```typescript
export class ImageService extends ApiService<Image> {
  // Subir imagen
  uploadImage(file: File, contestId: number, sectionId: number): Observable<Image>
  
  // Obtener imágenes por concurso
  getByContest(contestId: number): Observable<Image[]>
  
  // Obtener imágenes por sección
  getBySection(sectionId: number): Observable<Image[]>
  
  // Obtener imágenes por autor
  getByAuthor(profileId: number): Observable<Image[]>
  
  // Generar thumbnail
  generateThumbnail(imageId: number): Observable<string>
  
  // Comprimir imagen
  compressImage(file: File): Observable<File>
}
```

### CompressedPhotosService
**Archivo**: `src/app/services/compressed-photos.service.ts`

**Responsabilidad**: Gestión de descargas de fotografías comprimidas.

**Métodos**:
```typescript
export class CompressedPhotosService extends ApiService<CompressedPhotos> {
  // Generar archivo comprimido
  generateCompressedFile(contestId: number): Observable<CompressedPhotos>
  
  // Descargar archivo comprimido
  downloadCompressedFile(contestId: number): Observable<Blob>
  
  // Verificar estado de compresión
  checkCompressionStatus(contestId: number): Observable<any>
}
```

## 🔐 Servicios de Autenticación

### AuthService
**Archivo**: `src/app/modules/auth/services/auth.service.ts`

**Responsabilidad**: Gestión de autenticación y autorización.

**Métodos**:
```typescript
export class AuthService {
  // Login de usuario
  login(credentials: LoginCredentials): Observable<AuthResponse>
  
  // Logout de usuario
  logout(): void
  
  // Verificar si está autenticado
  isAuthenticated(): boolean
  
  // Obtener token actual
  getToken(): string | null
  
  // Refrescar token
  refreshToken(): Observable<AuthResponse>
  
  // Verificar expiración de token
  isTokenExpired(): boolean
  
  // Obtener información del usuario actual
  getCurrentUserInfo(): Observable<UserLogged>
}
```

### RolificadorService
**Archivo**: `src/app/modules/auth/services/rolificador.service.ts`

**Responsabilidad**: Gestión de roles y permisos.

**Métodos**:
```typescript
export class RolificadorService {
  // Verificar si usuario tiene rol
  hasRole(role: string): boolean
  
  // Verificar si usuario tiene permiso
  hasPermission(permission: string): boolean
  
  // Obtener roles del usuario
  getUserRoles(): string[]
  
  // Verificar si es administrador
  isAdmin(): boolean
  
  // Verificar si es juez
  isJudge(): boolean
  
  // Verificar si es usuario regular
  isRegularUser(): boolean
}
```

### AuthInterceptorService
**Archivo**: `src/app/modules/auth/services/auth-interceptor.service.ts`

**Responsabilidad**: Interceptor HTTP para manejo automático de tokens.

**Funcionalidad**:
```typescript
export class AuthInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar token a headers
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}
```

## 📊 Servicios de Estadísticas

### StadisticsService
**Archivo**: `src/app/services/stadistics.service.ts`

**Responsabilidad**: Gestión de estadísticas y métricas del sistema.

**Métodos**:
```typescript
export class StadisticsService extends ApiService<Stadistics> {
  // Obtener estadísticas generales
  getGeneralStats(): Observable<Stadistics>
  
  // Obtener estadísticas por usuario
  getUserStats(userId: number): Observable<Stadistics>
  
  // Obtener estadísticas por concurso
  getContestStats(contestId: number): Observable<Stadistics>
  
  // Obtener estadísticas por fotoclub
  getFotoclubStats(fotoclubId: number): Observable<Stadistics>
  
  // Generar reporte de estadísticas
  generateReport(params: any): Observable<any>
}
```

### RankingService
**Archivo**: `src/app/services/ranking.service.ts`

**Responsabilidad**: Gestión de rankings y clasificaciones.

**Métodos**:
```typescript
export class RankingService extends ApiService<any> {
  // Obtener ranking de perfiles
  getProfilesRanking(): Observable<Profile[]>
  
  // Obtener ranking de fotoclubs
  getFotoclubsRanking(): Observable<Fotoclub[]>
  
  // Obtener ranking por concurso
  getContestRanking(contestId: number): Observable<any>
  
  // Obtener ranking por sección
  getSectionRanking(sectionId: number): Observable<any>
  
  // Calcular puntuaciones
  calculateScores(contestId: number): Observable<any>
}
```

## 📰 Servicios de Contenido

### InfoCentroService
**Archivo**: `src/app/services/info-centro.service.ts`

**Responsabilidad**: Gestión de contenido informativo del centro.

**Métodos**:
```typescript
export class InfoCentroService extends ApiService<InfoCentro> {
  // Obtener contenido por categoría
  getByCategory(category: string): Observable<InfoCentro[]>
  
  // Obtener contenido destacado
  getFeatured(): Observable<InfoCentro[]>
  
  // Subir imagen de contenido
  uploadContentImage(contentId: number, imageFile: File): Observable<InfoCentro>
  
  // Publicar contenido
  publishContent(contentId: number): Observable<InfoCentro>
  
  // Despublicar contenido
  unpublishContent(contentId: number): Observable<InfoCentro>
}
```

### PublicInfoCentroService
**Archivo**: `src/app/services/public.info.centro.service.ts`

**Responsabilidad**: Acceso público a contenido informativo.

**Métodos**:
```typescript
export class PublicInfoCentroService extends ApiService<InfoCentro> {
  // Obtener contenido público
  getPublicContent(): Observable<InfoCentro[]>
  
  // Obtener contenido público por ID
  getPublicContentById(id: number): Observable<InfoCentro>
  
  // Buscar contenido público
  searchPublicContent(query: string): Observable<InfoCentro[]>
}
```

## 🔧 Servicios de Configuración

### ConfigService
**Archivo**: `src/app/services/config/config.service.ts`

**Responsabilidad**: Gestión de configuración de la aplicación.

**Métodos**:
```typescript
export class ConfigService {
  // Obtener configuración de API
  getApiUrl(): string
  
  // Obtener configuración de entorno
  getEnvironment(): string
  
  // Obtener configuración de features
  getFeatureFlags(): any
  
  // Verificar si feature está habilitado
  isFeatureEnabled(feature: string): boolean
  
  // Cargar configuración
  loadConfig(): Observable<any>
  
  // Actualizar configuración
  updateConfig(config: any): Observable<any>
}
```

## 🎨 Servicios de UI

### ResponsiveService
**Archivo**: `src/app/services/ui/responsive.service.ts`

**Responsabilidad**: Gestión de responsive design.

**Métodos**:
```typescript
export class ResponsiveService {
  // Verificar si es desktop
  isDesktop(): boolean
  
  // Verificar si es mobile
  isMobile(): boolean
  
  // Verificar si es tablet
  isTablet(): boolean
  
  // Obtener tamaño de pantalla
  getScreenSize(): { width: number, height: number }
  
  // Suscribirse a cambios de tamaño
  onResize(): Observable<{ width: number, height: number }>
  
  // Obtener breakpoint actual
  getCurrentBreakpoint(): string
}
```

### UiUtilsService
**Archivo**: `src/app/services/ui/ui-utils.service.ts`

**Responsabilidad**: Utilidades para interfaz de usuario.

**Métodos**:
```typescript
export class UiUtilsService {
  // Mostrar loading
  showLoading(message?: string): Promise<HTMLIonLoadingElement>
  
  // Ocultar loading
  hideLoading(): Promise<void>
  
  // Mostrar alerta
  showAlert(header: string, message: string): Promise<HTMLIonAlertElement>
  
  // Mostrar toast
  showToast(message: string, duration?: number): Promise<void>
  
  // Mostrar modal
  showModal(component: any, componentProps?: any): Promise<HTMLIonModalElement>
  
  // Mostrar popover
  showPopover(component: any, event: any, componentProps?: any): Promise<HTMLIonPopoverElement>
  
  // Confirmar acción
  confirmAction(message: string): Promise<boolean>
}
```

## 🔄 Servicios de Estado

### StateManagementService
**Archivo**: `src/app/services/state-management.service.ts`

**Responsabilidad**: Gestión centralizada del estado de la aplicación.

**Métodos**:
```typescript
export class StateManagementService {
  // Obtener estado
  getState(): Observable<any>
  
  // Actualizar estado
  updateState(newState: any): void
  
  // Suscribirse a cambios de estado
  onStateChange(): Observable<any>
  
  // Obtener valor específico del estado
  getValue(key: string): any
  
  // Establecer valor específico del estado
  setValue(key: string, value: any): void
  
  // Limpiar estado
  clearState(): void
}
```

## 📡 Servicios de Comunicación

### WebSocketService
**Archivo**: `src/app/services/websocket.service.ts`

**Responsabilidad**: Comunicación en tiempo real.

**Métodos**:
```typescript
export class WebSocketService {
  // Conectar al WebSocket
  connect(): void
  
  // Desconectar del WebSocket
  disconnect(): void
  
  // Enviar mensaje
  sendMessage(message: any): void
  
  // Suscribirse a mensajes
  onMessage(): Observable<any>
  
  // Suscribirse a eventos específicos
  onEvent(event: string): Observable<any>
  
  // Verificar estado de conexión
  isConnected(): boolean
}
```

## 🔍 Servicios de Búsqueda

### SearchService
**Archivo**: `src/app/services/search.service.ts`

**Responsabilidad**: Funcionalidad de búsqueda global.

**Métodos**:
```typescript
export class SearchService {
  // Búsqueda global
  globalSearch(query: string): Observable<SearchResult[]>
  
  // Búsqueda en concursos
  searchContests(query: string): Observable<Contest[]>
  
  // Búsqueda en usuarios
  searchUsers(query: string): Observable<User[]>
  
  // Búsqueda en imágenes
  searchImages(query: string): Observable<Image[]>
  
  // Búsqueda avanzada
  advancedSearch(params: SearchParams): Observable<SearchResult[]>
  
  // Obtener sugerencias de búsqueda
  getSearchSuggestions(query: string): Observable<string[]>
}
```

## 📋 Patrones de Uso

### Inyección de Dependencias
```typescript
// En componente
export class ExampleComponent {
  constructor(
    private contestService: ContestService,
    private userService: UserService,
    private authService: AuthService
  ) {}
}
```

### Manejo de Errores
```typescript
// Patrón de manejo de errores
this.service.getData().subscribe({
  next: (data) => {
    // Manejo exitoso
    this.handleSuccess(data);
  },
  error: (error) => {
    // Manejo de error
    this.handleError(error);
  },
  complete: () => {
    // Operación completada
    this.handleComplete();
  }
});
```

### Cache de Datos
```typescript
// Implementación de cache
export class CachedService extends ApiService<any> {
  private cache = new Map<string, any>();
  
  getCachedData(key: string): Observable<any> {
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }
    
    return this.http.get<any>(`${this.apiUrl}/${key}`).pipe(
      tap(data => this.cache.set(key, data))
    );
  }
}
```

### Interceptores Personalizados
```typescript
// Interceptor para logging
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`Request: ${req.method} ${req.url}`);
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`Response: ${event.status} ${event.url}`);
        }
      })
    );
  }
}
```

## 🧪 Testing de Servicios

### Estructura de Tests
```typescript
describe('ContestService', () => {
  let service: ContestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContestService, ConfigService]
    });
    
    service = TestBed.inject(ContestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve contests', () => {
    const mockContests = [
      { id: 1, name: 'Concurso 1' },
      { id: 2, name: 'Concurso 2' }
    ];

    service.getAll().subscribe(contests => {
      expect(contests).toEqual(mockContests);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/contest`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContests);
  });
});
```

## 📊 Métricas de Servicios

### Métricas de Rendimiento
- **Tiempo de respuesta promedio**: < 500ms
- **Tasa de éxito**: > 99%
- **Uso de memoria**: < 50MB
- **Número de requests concurrentes**: < 100

### Métricas de Uso
- **Servicios más utilizados**:
  1. ContestService
  2. AuthService
  3. ImageService
  4. UserService
  5. ProfileService

## 🔮 Futuros Servicios

### Servicios Planificados
- **NotificationService**: Gestión de notificaciones push
- **AnalyticsService**: Análisis de uso y métricas
- **ExportService**: Exportación de datos
- **ImportService**: Importación de datos
- **BackupService**: Respaldo de datos
- **SyncService**: Sincronización offline

---

*Esta documentación se actualiza automáticamente con cada cambio en los servicios del sistema.* 