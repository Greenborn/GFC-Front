# Guías de Desarrollo - Grupo Fotográfico Centro

## 📋 Descripción General

Este documento proporciona guías detalladas, mejores prácticas y convenciones de desarrollo para el proyecto Grupo Fotográfico Centro.

**Última actualización**: Octubre 2025  
**Versión del proyecto**: 1.9.15

## 📚 Índice

1. [Configuración del Entorno](#-configuración-del-entorno)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Convenciones de Código](#-convenciones-de-código)
4. [Patrones de Desarrollo](#-patrones-de-desarrollo)
5. [Gestión de Estado](#-gestión-de-estado)
6. [Testing](#-testing)
7. [Optimización y Performance](#-optimización-y-performance)
8. [Seguridad](#-seguridad)
9. [Deployment](#-deployment)
10. [Troubleshooting](#-troubleshooting)

## 🛠️ Configuración del Entorno

### Prerequisitos

```bash
# Node.js (versión LTS recomendada)
node --version  # v14.x o superior

# npm o yarn
npm --version   # 6.x o superior

# Angular CLI
npm install -g @angular/cli@12

# Ionic CLI
npm install -g @ionic/cli
```

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd GFC-Front/angular

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# 4. Generar archivos de entorno
npm run generate-env

# 5. Iniciar servidor de desarrollo
npm start
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto angular:

```bash
# API Configuration
API_BASE_URL=https://gfc.prod-api.greenborn.com.ar/
PUBLIC_API_URL=https://gfc.api2.greenborn.com.ar/api/
LOGIN_ACTION=login
APP_NAME=app_gfc_dev-

# Images Configuration
IMAGES_BASE_URL=https://assets.prod-gfc.greenborn.com.ar

# Node API Configuration
NODE_API_BASE_URL=https://gfc.api2.greenborn.com.ar/api/

# App Configuration
VERSION=1.9.15
PRODUCTION=false
```

## 📁 Estructura del Proyecto

### Organización de Carpetas

```
src/
├── app/
│   ├── concursos/              # Módulo de concursos
│   │   ├── concurso-detail/    # Detalle de concurso
│   │   ├── concurso-post/      # Crear/Editar concurso
│   │   ├── metricas-abm/       # Gestión de métricas
│   │   └── secciones-abm/      # Gestión de secciones
│   ├── usuario/                # Módulo de usuarios
│   │   ├── perfil/             # Perfil de usuario
│   │   └── usuarios-abm/       # Administración de usuarios
│   ├── modules/
│   │   └── auth/               # Módulo de autenticación
│   │       ├── components/     # Componentes de auth
│   │       ├── guards/         # Guards de rutas
│   │       ├── services/       # Servicios de auth
│   │       └── validators/     # Validadores
│   ├── shared/                 # Componentes compartidos
│   │   ├── search-bar/
│   │   ├── menu-acciones/
│   │   └── ...
│   ├── services/               # Servicios globales
│   │   ├── api.service.ts      # Servicio base API
│   │   ├── config/             # Configuración
│   │   └── ...
│   ├── models/                 # Modelos de datos
│   │   ├── user.model.ts
│   │   ├── contest.model.ts
│   │   └── ...
│   └── nav/                    # Componentes de navegación
│       ├── navbar/
│       ├── sidebar/
│       └── footer/
├── assets/                     # Recursos estáticos
│   ├── images/
│   ├── icons/
│   └── ...
├── environments/               # Configuraciones de entorno
│   ├── environment.ts
│   └── environment.prod.ts
└── theme/                      # Estilos globales
    └── variables.scss
```

### Nomenclatura de Archivos

```
component-name.component.ts      # Componente
component-name.component.html    # Template
component-name.component.scss    # Estilos
component-name.component.spec.ts # Tests

service-name.service.ts          # Servicio
service-name.service.spec.ts     # Tests

model-name.model.ts              # Modelo

guard-name.guard.ts              # Guard
validator-name.validator.ts      # Validador
```

## 📝 Convenciones de Código

### TypeScript

#### Nomenclatura

```typescript
// Clases e Interfaces: PascalCase
export class UserService { }
export interface User { }

// Métodos y Variables: camelCase
getUserById(id: number) { }
const userName = 'John';

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10485760;
const API_BASE_URL = 'https://api.example.com';

// Archivos: kebab-case
user-service.ts
contest-detail.component.ts
```

#### Tipos e Interfaces

```typescript
// Preferir interfaces sobre types para objetos
interface User {
  id: number;
  username: string;
  email: string;
}

// Usar types para uniones, intersecciones, etc.
type UserRole = 'admin' | 'user' | 'judge';
type UserId = number | string;

// Siempre tipar parámetros y retornos
function getUser(id: number): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`);
}

// Evitar 'any', usar tipos específicos
// MAL
function process(data: any) { }

// BIEN
function process(data: User | Contest) { }
```

#### Async/Await y Observables

```typescript
// Usar Observables para operaciones HTTP
getUser(id: number): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`);
}

// Usar async/await para Promises
async loadData(): Promise<void> {
  try {
    const data = await this.service.getData().toPromise();
    this.data = data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Manejar subscriptions correctamente
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### HTML/Templates

```html
<!-- Usar structural directives correctamente -->
<div *ngIf="user">{{ user.name }}</div>
<div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>

<!-- Usar property binding y event binding -->
<input [value]="userName" (input)="onNameChange($event)">

<!-- Usar pipes para formateo -->
<p>{{ date | date:'dd/MM/yyyy' }}</p>
<p>{{ price | currency:'ARS' }}</p>

<!-- Clases condicionales -->
<div [class.active]="isActive" [class.disabled]="!isEnabled">

<!-- ngClass para múltiples clases -->
<div [ngClass]="{
  'active': isActive,
  'disabled': !isEnabled,
  'highlight': isHighlighted
}">
```

### SCSS/Estilos

```scss
// Variables globales en theme/variables.scss
$primary-color: #3880ff;
$secondary-color: #3dc2ff;

// Usar variables CSS de Ionic
.my-component {
  color: var(--ion-color-primary);
  padding: var(--ion-padding);
}

// Scoped styles en componentes
:host {
  display: block;
  
  .container {
    padding: 1rem;
    
    .title {
      font-size: 1.5rem;
      font-weight: bold;
    }
  }
}

// BEM para clases complejas
.card {
  &__header {
    border-bottom: 1px solid #ccc;
  }
  
  &__body {
    padding: 1rem;
  }
  
  &--highlighted {
    background-color: yellow;
  }
}
```

## 🔧 Patrones de Desarrollo

### Servicios

#### Patrón ApiService Base

```typescript
// api.service.ts - Servicio base
@Injectable()
export abstract class ApiService<T> {
  protected abstract resourceName: string;
  
  constructor(
    protected http: HttpClient,
    protected config: ConfigService
  ) {}
  
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.getUrl());
  }
  
  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.getUrl()}/${id}`);
  }
  
  post(data: T): Observable<T> {
    return this.http.post<T>(this.getUrl(), data);
  }
  
  put(data: T, id: number): Observable<T> {
    return this.http.put<T>(`${this.getUrl()}/${id}`, data);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getUrl()}/${id}`);
  }
  
  protected getUrl(): string {
    return this.config.apiUrl(this.resourceName);
  }
}

// user.service.ts - Servicio específico
@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService<User> {
  protected resourceName = 'user';
  
  constructor(
    http: HttpClient,
    config: ConfigService
  ) {
    super(http, config);
  }
  
  // Métodos específicos
  changePassword(userId: number, passwords: ChangePasswordData): Observable<void> {
    return this.http.put<void>(
      `${this.getUrl()}/${userId}/change-password`,
      passwords
    );
  }
}
```

### Componentes

#### Patrón Smart/Dumb Components

```typescript
// Smart Component (Container)
@Component({
  selector: 'app-contest-list-container',
  template: `
    <app-contest-list
      [contests]="contests$ | async"
      [loading]="loading$ | async"
      (contestClick)="onContestClick($event)"
      (createClick)="onCreateClick()">
    </app-contest-list>
  `
})
export class ContestListContainerComponent implements OnInit {
  contests$: Observable<Contest[]>;
  loading$: Observable<boolean>;
  
  constructor(private contestService: ContestService) {}
  
  ngOnInit(): void {
    this.contests$ = this.contestService.getAll();
    this.loading$ = this.contestService.loading$;
  }
  
  onContestClick(contest: Contest): void {
    // Lógica de navegación
  }
  
  onCreateClick(): void {
    // Lógica de creación
  }
}

// Dumb Component (Presentational)
@Component({
  selector: 'app-contest-list',
  templateUrl: './contest-list.component.html'
})
export class ContestListComponent {
  @Input() contests: Contest[];
  @Input() loading: boolean;
  @Output() contestClick = new EventEmitter<Contest>();
  @Output() createClick = new EventEmitter<void>();
  
  trackByContestId(index: number, contest: Contest): number {
    return contest.id;
  }
}
```

### Guards

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirigir a login con returnUrl
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}

// Uso en rutas
{
  path: 'concursos',
  canActivate: [AuthGuard],
  loadChildren: () => import('./concursos/concursos.module')
    .then(m => m.ConcursosPageModule)
}
```

### Interceptores HTTP

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Agregar token de autenticación
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
        if (error.status === 401) {
          // Manejar error de autenticación
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
```

## 🔄 Gestión de Estado

### Patrón Service + Subject

```typescript
@Injectable({
  providedIn: 'root'
})
export class StateService {
  private contestsSubject = new BehaviorSubject<Contest[]>([]);
  public contests$ = this.contestsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  loadContests(): void {
    this.loadingSubject.next(true);
    
    this.http.get<Contest[]>('/api/contests')
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: contests => this.contestsSubject.next(contests),
        error: error => console.error('Error loading contests:', error)
      });
  }
  
  addContest(contest: Contest): void {
    const currentContests = this.contestsSubject.value;
    this.contestsSubject.next([...currentContests, contest]);
  }
  
  updateContest(updatedContest: Contest): void {
    const contests = this.contestsSubject.value.map(c =>
      c.id === updatedContest.id ? updatedContest : c
    );
    this.contestsSubject.next(contests);
  }
  
  deleteContest(id: number): void {
    const contests = this.contestsSubject.value.filter(c => c.id !== id);
    this.contestsSubject.next(contests);
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, ConfigService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should retrieve users', () => {
    const mockUsers: User[] = [
      { id: 1, username: 'user1', email: 'user1@test.com' },
      { id: 2, username: 'user2', email: 'user2@test.com' }
    ];
    
    service.getAll().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });
    
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
  
  it('should handle error', () => {
    service.getAll().subscribe({
      next: () => fail('should have failed'),
      error: error => {
        expect(error.status).toBe(404);
      }
    });
    
    const req = httpMock.expectOne('/api/users');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
```

### Component Tests

```typescript
describe('ContestListComponent', () => {
  let component: ContestListComponent;
  let fixture: ComponentFixture<ContestListComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContestListComponent],
      imports: [IonicModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ContestListComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display contests', () => {
    component.contests = [
      { id: 1, name: 'Contest 1' },
      { id: 2, name: 'Contest 2' }
    ];
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.contest-item');
    expect(items.length).toBe(2);
  });
  
  it('should emit event on contest click', () => {
    const contest = { id: 1, name: 'Contest 1' };
    let emittedContest: Contest;
    
    component.contestClick.subscribe(c => emittedContest = c);
    component.onContestClick(contest);
    
    expect(emittedContest).toEqual(contest);
  });
});
```

## ⚡ Optimización y Performance

### Lazy Loading

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'concursos',
    loadChildren: () => import('./concursos/concursos.module')
      .then(m => m.ConcursosPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuario/usuario.module')
      .then(m => m.UsuarioPageModule)
  }
];
```

### ChangeDetection Strategy

```typescript
@Component({
  selector: 'app-contest-item',
  templateUrl: './contest-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContestItemComponent {
  @Input() contest: Contest;
}
```

### TrackBy Functions

```typescript
@Component({
  template: `
    <div *ngFor="let item of items; trackBy: trackById">
      {{ item.name }}
    </div>
  `
})
export class ListComponent {
  trackById(index: number, item: any): number {
    return item.id;
  }
}
```

### Image Optimization

```typescript
// Usar tamaños optimizados
getImageUrl(imageUrl: string, size: 'thumbnail' | 'medium' | 'large'): string {
  const sizeParams = {
    thumbnail: '?w=150&h=150',
    medium: '?w=500&h=500',
    large: '?w=1200&h=1200'
  };
  
  return `${this.config.imagesBaseUrl}${imageUrl}${sizeParams[size]}`;
}
```

## 🔒 Seguridad

### Sanitización de Inputs

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({...})
export class MyComponent {
  constructor(private sanitizer: DomSanitizer) {}
  
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, html);
  }
}
```

### Validación de Formularios

```typescript
this.form = this.fb.group({
  username: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
    Validators.pattern('^[a-zA-Z0-9_]+$')
  ]],
  email: ['', [
    Validators.required,
    Validators.email
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    this.passwordValidator()
  ]]
});

// Validador personalizado
passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    
    const valid = hasUpperCase && hasLowerCase && hasNumeric;
    
    return !valid ? { weakPassword: true } : null;
  };
}
```

## 🚀 Deployment

### Build para Producción

```bash
# Build completo
npm run build

# Build con análisis de bundle
ng build --configuration=production --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Verificar tamaño de bundles
ls -lh build/public_html/*.js
```

### Variables de Entorno por Ambiente

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://gfc.prod-api.greenborn.com.ar/',
  imagesBaseUrl: 'https://assets.prod-gfc.greenborn.com.ar'
};

// environment.ts (development)
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/',
  imagesBaseUrl: 'http://localhost:3000/images'
};
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de CORS

```typescript
// Agregar proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}

// Actualizar angular.json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

#### Problemas de Memoria en Build

```bash
# Aumentar memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

#### Errores de TypeScript

```bash
# Limpiar cache
rm -rf node_modules
rm package-lock.json
npm install

# Verificar versiones
ng version
```

---

**Última actualización**: Octubre 2025  
**Mantenido por**: Equipo de Desarrollo Greenborn
