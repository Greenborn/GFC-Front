# Documentación de Rutas - Grupo Fotográfico Centro

## 📋 Descripción General

Esta documentación describe todas las rutas de la aplicación, organizadas por módulos y funcionalidad. Incluye información sobre protección de rutas, parámetros y navegación.

## 🏗️ Estructura de Rutas

### Configuración Principal
**Archivo**: `src/app/app-routing.module.ts`

La aplicación utiliza **lazy loading** para optimizar el rendimiento, cargando módulos solo cuando son necesarios.

```typescript
const routes: Routes = [
  // Rutas principales con lazy loading
  {
    path: 'concursos',
    canActivate: [AuthGuard],
    children: [...]
  },
  // Otras rutas...
];
```

## 🔐 Rutas de Autenticación

### Login
- **Ruta**: `/login`
- **Módulo**: `AuthModule`
- **Componente**: `LoginViewComponent`
- **Protección**: Sin protección (acceso público)
- **Descripción**: Página de inicio de sesión

```typescript
{
  path: 'login',
  component: LoginViewComponent
}
```

## 🏆 Rutas de Concursos

### Lista de Concursos
- **Ruta**: `/concursos`
- **Módulo**: `ConcursosPageModule`
- **Componente**: `ConcursosPage`
- **Protección**: `AuthGuard`
- **Descripción**: Página principal con lista de todos los concursos

### Crear Concurso
- **Ruta**: `/concursos/nuevo`
- **Módulo**: `ConcursoPostPageModule`
- **Componente**: `ConcursoPostPage`
- **Protección**: `AuthGuard`
- **Descripción**: Formulario para crear nuevo concurso

### Editar Concurso
- **Ruta**: `/concursos/editar/:id`
- **Módulo**: `ConcursoPostPageModule`
- **Componente**: `ConcursoPostPage`
- **Protección**: `AuthGuard`
- **Parámetros**: `id` (ID del concurso)
- **Descripción**: Formulario para editar concurso existente

### Detalle de Concurso
- **Ruta**: `/concursos/:id`
- **Módulo**: `ConcursoDetailPageModule`
- **Componente**: `ConcursoDetailPage`
- **Protección**: `AuthGuard`
- **Parámetros**: `id` (ID del concurso)
- **Descripción**: Página de detalle del concurso con navegación por tabs

#### Subrutas del Detalle de Concurso

##### Información del Concurso
- **Ruta**: `/concursos/:id/informacion`
- **Componente**: `InformacionComponent`
- **Descripción**: Información general del concurso

##### Concursantes
- **Ruta**: `/concursos/:id/concursantes`
- **Componente**: `ConcursantesComponent`
- **Descripción**: Gestión de participantes del concurso

##### Fotografías
- **Ruta**: `/concursos/:id/fotografias`
- **Componente**: `FotografiasComponent`
- **Descripción**: Galería de fotografías del concurso

##### Jueces
- **Ruta**: `/concursos/:id/jueces`
- **Componente**: `JuecesComponent`
- **Descripción**: Gestión de jueces del concurso

##### Juzgamiento
- **Ruta**: `/concursos/:id/juzgamiento`
- **Componente**: `JuzgamientoComponent`
- **Descripción**: Sistema de evaluación y juzgamiento

### Secciones ABM
- **Ruta**: `/concursos/secciones`
- **Módulo**: `SeccionesAbmPageModule`
- **Componente**: `SeccionesAbmPage`
- **Protección**: `AuthGuard`
- **Descripción**: Administración de secciones de concursos

### Métricas ABM
- **Ruta**: `/concursos/metricas`
- **Módulo**: `MetricasAbmPageModule`
- **Componente**: `MetricasAbmPage`
- **Protección**: `AuthGuard`
- **Descripción**: Administración de métricas de evaluación

### Ranking
- **Ruta**: `/concursos/ranking`
- **Módulo**: `ConcursosPageModule`
- **Componente**: `RankingPage`
- **Protección**: `AuthGuard`
- **Descripción**: Ranking de participantes y organizaciones

## 👤 Rutas de Usuarios

### Perfil de Usuario
- **Ruta**: `/perfil/:id`
- **Módulo**: `PerfilPageModule`
- **Componente**: `PerfilPage`
- **Protección**: `AuthGuard`
- **Parámetros**: `id` (ID del usuario)
- **Descripción**: Visualización de perfil de usuario específico

### Editar Perfil
- **Ruta**: `/perfil/editar`
- **Módulo**: `UsuarioPageModule`
- **Componente**: `UsuarioPage`
- **Protección**: `AuthGuard`
- **Descripción**: Edición del perfil del usuario actual

### Administración de Usuarios
- **Ruta**: `/usuarios`
- **Módulo**: `UsuariosAbmPageModule`
- **Componente**: `UsuariosAbmPage`
- **Protección**: `AuthGuard`
- **Descripción**: Lista de usuarios del sistema

### Crear Usuario
- **Ruta**: `/usuarios/nuevo`
- **Módulo**: `UsuarioPostPageModule`
- **Componente**: `UsuarioPostPage`
- **Protección**: `AuthGuard`
- **Descripción**: Formulario para crear nuevo usuario

### Editar Usuario
- **Ruta**: `/usuarios/editar/:id`
- **Módulo**: `UsuarioPostPageModule`
- **Componente**: `UsuarioPostPage`
- **Protección**: `AuthGuard`
- **Parámetros**: `id` (ID del usuario)
- **Descripción**: Formulario para editar usuario existente

### Registro de Usuario
- **Ruta**: `/registro`
- **Módulo**: `UsuarioPostPageModule`
- **Componente**: `UsuarioPostPage`
- **Protección**: Sin protección (acceso público)
- **Descripción**: Formulario de registro para nuevos usuarios

## 📰 Rutas de Información del Centro

### Página Principal
- **Ruta**: `/`
- **Módulo**: `InfoCentroPageModule`
- **Componente**: `InfoCentroPage`
- **Protección**: Sin protección (acceso público)
- **Descripción**: Página principal con información del centro fotográfico

## 🏢 Rutas de Organizaciones

### Administración de Organizaciones
- **Ruta**: `/organizaciones`
- **Módulo**: `FotoclubsAbmPageModule`
- **Componente**: `FotoclubsAbmPage`
- **Protección**: Sin protección (acceso público)
- **Descripción**: Lista de organizaciones/fotoclubs

## 🔔 Rutas de Notificaciones

### Notificaciones
- **Ruta**: `/notificaciones`
- **Módulo**: `NotificacionesPageModule`
- **Componente**: `NotificacionesPage`
- **Protección**: `AuthGuard`
- **Descripción**: Centro de notificaciones del usuario

## 📁 Rutas de Sistema

### Folder (Sistema)
- **Ruta**: `/folder/:id`
- **Módulo**: `FolderPageModule`
- **Componente**: `FolderPage`
- **Protección**: Sin protección
- **Parámetros**: `id` (ID del folder)
- **Descripción**: Rutas del sistema (Inbox, Outbox, etc.)

## 🛡️ Protección de Rutas

### AuthGuard
**Archivo**: `src/app/modules/auth/guards/auth.guard.ts`

El `AuthGuard` protege las rutas que requieren autenticación:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verifica si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirige al login si no está autenticado
    this.router.navigate(['/login']);
    return false;
  }
}
```

### Rutas Protegidas
Las siguientes rutas requieren autenticación:
- `/concursos/*`
- `/perfil/*`
- `/usuarios/*`
- `/notificaciones`

### Rutas Públicas
Las siguientes rutas son accesibles sin autenticación:
- `/` (página principal)
- `/login`
- `/registro`
- `/organizaciones`

## 🔄 Navegación Programática

### Servicio de Navegación
**Archivo**: `src/app/services/navigation.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  // Navegar a concurso específico
  navigateToContest(contestId: number): void {
    this.router.navigate(['/concursos', contestId]);
  }

  // Navegar a perfil de usuario
  navigateToProfile(userId: number): void {
    this.router.navigate(['/perfil', userId]);
  }

  // Navegar a creación de concurso
  navigateToCreateContest(): void {
    this.router.navigate(['/concursos', 'nuevo']);
  }

  // Navegar a edición de concurso
  navigateToEditContest(contestId: number): void {
    this.router.navigate(['/concursos', 'editar', contestId]);
  }
}
```

### Ejemplos de Uso

#### Navegación desde Componente
```typescript
export class ContestListComponent {
  constructor(private router: Router) {}

  onContestClick(contestId: number): void {
    this.router.navigate(['/concursos', contestId]);
  }

  onCreateContest(): void {
    this.router.navigate(['/concursos', 'nuevo']);
  }
}
```

#### Navegación con Parámetros
```typescript
// Navegar con parámetros de query
this.router.navigate(['/concursos'], {
  queryParams: { 
    section: 'naturaleza',
    year: '2024'
  }
});

// Navegar con parámetros de ruta
this.router.navigate(['/concursos', contestId, 'fotografias']);
```

#### Navegación con Estado
```typescript
// Navegar con datos adicionales
this.router.navigate(['/concursos', contestId], {
  state: { 
    returnUrl: '/concursos',
    contestData: contest
  }
});
```

## 📱 Rutas Responsive

### Navegación Móvil
```typescript
// Detectar si es móvil para ajustar navegación
export class NavigationComponent {
  constructor(private responsiveService: ResponsiveService) {}

  onMenuClick(): void {
    if (this.responsiveService.isMobile()) {
      // Cerrar sidebar en móvil
      this.closeSidebar();
    }
  }
}
```

### Rutas Adaptativas
```typescript
// Rutas que cambian según el dispositivo
const mobileRoutes = [
  { path: 'concursos', component: ConcursosMobilePage },
  { path: 'perfil', component: PerfilMobilePage }
];

const desktopRoutes = [
  { path: 'concursos', component: ConcursosDesktopPage },
  { path: 'perfil', component: PerfilDesktopPage }
];
```

## 🔍 Rutas de Búsqueda y Filtros

### Parámetros de Query
```typescript
// Ejemplo de ruta con filtros
/concursos?section=naturaleza&year=2024&status=active

// Obtener parámetros en componente
export class ContestListComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      const year = params['year'];
      const status = params['status'];
      
      this.applyFilters(section, year, status);
    });
  }
}
```

### Rutas con Filtros Persistentes
```typescript
// Mantener filtros en la URL
export class FilterService {
  updateFilters(filters: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filters,
      queryParamsHandling: 'merge'
    });
  }
}
```

## 🚨 Manejo de Errores en Rutas

### Rutas de Error
```typescript
// Ruta 404
{
  path: '**',
  component: NotFoundComponent
}

// Ruta de error
{
  path: 'error',
  component: ErrorComponent
}
```

### Interceptores de Error
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Redirigir al login
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          // Redirigir a página 404
          this.router.navigate(['/error']);
        }
        return throwError(error);
      })
    );
  }
}
```

## 📊 Análisis de Rutas

### Métricas de Uso
```typescript
// Servicio para analizar uso de rutas
@Injectable({
  providedIn: 'root'
})
export class RouteAnalyticsService {
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackRoute(event.url);
    });
  }

  private trackRoute(url: string): void {
    // Enviar métricas de navegación
    console.log('Navegación a:', url);
  }
}
```

### Rutas Más Utilizadas
1. `/concursos` - Lista de concursos
2. `/concursos/:id` - Detalle de concurso
3. `/perfil/:id` - Perfil de usuario
4. `/` - Página principal
5. `/usuarios` - Administración de usuarios

## 🔧 Configuración de Rutas

### Configuración de Lazy Loading
```typescript
// Ejemplo de configuración de lazy loading
{
  path: 'concursos',
  loadChildren: () => import('./concursos/concursos.module')
    .then(m => m.ConcursosPageModule),
  canActivate: [AuthGuard]
}
```

### Configuración de Preloading
```typescript
// En app-routing.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ]
})
```

### Configuración de Scroll
```typescript
// Restaurar posición de scroll
{
  path: 'concursos',
  component: ConcursosPage,
  scrollPositionRestoration: 'enabled'
}
```

## 📋 Mapa Completo de Rutas

### Estructura Jerárquica
```
/
├── login
├── registro
├── concursos/
│   ├── nuevo
│   ├── editar/:id
│   ├── :id/
│   │   ├── informacion
│   │   ├── concursantes
│   │   ├── fotografias
│   │   ├── jueces
│   │   └── juzgamiento
│   ├── secciones
│   ├── metricas
│   └── ranking
├── perfil/
│   ├── :id
│   └── editar
├── usuarios/
│   ├── nuevo
│   └── editar/:id
├── organizaciones
├── notificaciones
└── folder/:id
```

### Tabla de Rutas Completa

| Ruta | Módulo | Componente | Protección | Descripción |
|------|--------|------------|------------|-------------|
| `/` | InfoCentroPageModule | InfoCentroPage | Pública | Página principal |
| `/login` | AuthModule | LoginViewComponent | Pública | Login de usuarios |
| `/registro` | UsuarioPostPageModule | UsuarioPostPage | Pública | Registro de usuarios |
| `/concursos` | ConcursosPageModule | ConcursosPage | AuthGuard | Lista de concursos |
| `/concursos/nuevo` | ConcursoPostPageModule | ConcursoPostPage | AuthGuard | Crear concurso |
| `/concursos/editar/:id` | ConcursoPostPageModule | ConcursoPostPage | AuthGuard | Editar concurso |
| `/concursos/:id` | ConcursoDetailPageModule | ConcursoDetailPage | AuthGuard | Detalle de concurso |
| `/concursos/:id/informacion` | ConcursoDetailPageModule | InformacionComponent | AuthGuard | Info del concurso |
| `/concursos/:id/concursantes` | ConcursoDetailPageModule | ConcursantesComponent | AuthGuard | Participantes |
| `/concursos/:id/fotografias` | ConcursoDetailPageModule | FotografiasComponent | AuthGuard | Galería de fotos |
| `/concursos/:id/jueces` | ConcursoDetailPageModule | JuecesComponent | AuthGuard | Jueces del concurso |
| `/concursos/:id/juzgamiento` | ConcursoDetailPageModule | JuzgamientoComponent | AuthGuard | Sistema de evaluación |
| `/concursos/secciones` | SeccionesAbmPageModule | SeccionesAbmPage | AuthGuard | Admin de secciones |
| `/concursos/metricas` | MetricasAbmPageModule | MetricasAbmPage | AuthGuard | Admin de métricas |
| `/concursos/ranking` | ConcursosPageModule | RankingPage | AuthGuard | Ranking general |
| `/perfil/:id` | PerfilPageModule | PerfilPage | AuthGuard | Perfil de usuario |
| `/perfil/editar` | UsuarioPageModule | UsuarioPage | AuthGuard | Editar perfil |
| `/usuarios` | UsuariosAbmPageModule | UsuariosAbmPage | AuthGuard | Admin de usuarios |
| `/usuarios/nuevo` | UsuarioPostPageModule | UsuarioPostPage | AuthGuard | Crear usuario |
| `/usuarios/editar/:id` | UsuarioPostPageModule | UsuarioPostPage | AuthGuard | Editar usuario |
| `/organizaciones` | FotoclubsAbmPageModule | FotoclubsAbmPage | Pública | Lista de organizaciones |
| `/notificaciones` | NotificacionesPageModule | NotificacionesPage | AuthGuard | Centro de notificaciones |
| `/folder/:id` | FolderPageModule | FolderPage | Pública | Sistema de carpetas |

## 🔮 Futuras Rutas

### Rutas Planificadas
- `/admin` - Panel de administración
- `/reportes` - Sistema de reportes
- `/configuracion` - Configuración del sistema
- `/ayuda` - Centro de ayuda
- `/api-docs` - Documentación de API

### Rutas de API
- `/api/concursos` - API de concursos
- `/api/usuarios` - API de usuarios
- `/api/fotografias` - API de fotografías
- `/api/auth` - API de autenticación

---

*Esta documentación se actualiza automáticamente con cada cambio en las rutas del sistema.* 