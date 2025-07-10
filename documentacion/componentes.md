# Documentación de Componentes - Grupo Fotográfico Centro

## 📋 Descripción General

Esta documentación describe todos los componentes de la aplicación, organizados por módulos y funcionalidad. Cada componente incluye su propósito, propiedades, eventos y ejemplos de uso.

## 🏗️ Estructura de Componentes

### Jerarquía de Componentes
```
AppComponent
├── NavbarComponent
├── SidebarComponent
├── FooterComponent
└── RouterOutlet
    ├── AuthModule
    ├── ConcursosModule
    ├── UsuarioModule
    ├── InfoCentroModule
    └── FotoclubsAbmModule
```

## 🔐 Módulo de Autenticación (AuthModule)

### LoginViewComponent
**Archivo**: `src/app/modules/auth/components/login-view/login-view.component.ts`

**Propósito**: Componente principal para la autenticación de usuarios.

**Características**:
- Formulario de login con validación
- Integración con AuthService
- Manejo de errores de autenticación
- Redirección post-login

**Propiedades**:
```typescript
interface LoginViewComponent {
  loginForm: FormGroup;
  loading: boolean;
  errorMessage: string;
}
```

**Eventos**:
- `onSubmit()`: Envía credenciales de login
- `onError()`: Maneja errores de autenticación

**Uso**:
```html
<app-login-view></app-login-view>
```

## 🏆 Módulo de Concursos (ConcursosModule)

### ConcursosPage
**Archivo**: `src/app/concursos/concursos.page.ts`

**Propósito**: Página principal que lista todos los concursos disponibles.

**Características**:
- Lista de concursos con filtros
- Búsqueda y ordenamiento
- Acciones CRUD para administradores
- Integración con ContestService

**Propiedades**:
```typescript
interface ConcursosPage {
  contests: Contest[];
  filteredContests: Contest[];
  searchTerm: string;
  sortBy: string;
  loading: boolean;
}
```

**Métodos**:
- `loadContests()`: Carga lista de concursos
- `filterContests()`: Filtra concursos por término de búsqueda
- `sortContests()`: Ordena concursos por criterio
- `createContest()`: Navega a creación de concurso
- `editContest(id)`: Navega a edición de concurso

### RankingPage
**Archivo**: `src/app/concursos/ranking/ranking.page.ts`

**Propósito**: Muestra el ranking de participantes y organizaciones.

**Características**:
- Ranking de perfiles
- Ranking de fotoclubs
- Estadísticas de participación
- Integración con RankingService

**Propiedades**:
```typescript
interface RankingPage {
  profilesRanking: Profile[];
  fotoclubsRanking: Fotoclub[];
  loading: boolean;
}
```

### SeccionPostComponent
**Archivo**: `src/app/concursos/secciones-abm/seccion-post/seccion-post.component.ts`

**Propósito**: Formulario para crear y editar secciones de concursos.

**Características**:
- Formulario reactivo
- Validación de campos
- Integración con SectionService
- Manejo de errores

**Propiedades**:
```typescript
interface SeccionPostComponent {
  sectionForm: FormGroup;
  section: Section;
  isEditMode: boolean;
  loading: boolean;
}
```

### MetricasPostComponent
**Archivo**: `src/app/concursos/metricas-abm/metricas-post/metricas-post.component.ts`

**Propósito**: Formulario para crear y editar métricas de evaluación.

**Características**:
- Formulario de métricas
- Validación de puntajes
- Integración con MetricService

## 📸 Módulo de Detalle de Concurso (ConcursoDetailModule)

### ConcursoDetailPage
**Archivo**: `src/app/concursos/concurso-detail/concurso-detail.page.ts`

**Propósito**: Página principal del detalle de un concurso específico.

**Características**:
- Navegación por tabs
- Información general del concurso
- Gestión de participantes y fotografías
- Control de acceso basado en roles

**Propiedades**:
```typescript
interface ConcursoDetailPage {
  contest: Contest;
  activeTab: string;
  userRole: string;
  loading: boolean;
}
```

**Tabs Disponibles**:
- Información
- Concursantes
- Fotografías
- Jueces
- Juzgamiento

### InformacionComponent
**Archivo**: `src/app/concursos/concurso-detail/informacion/informacion.component.ts`

**Propósito**: Muestra información detallada del concurso.

**Características**:
- Información general del concurso
- Fechas y reglas
- Estadísticas de participación
- Acciones administrativas

### ConcursantesComponent
**Archivo**: `src/app/concursos/concurso-detail/concursantes/concursantes.component.ts`

**Propósito**: Gestión de participantes del concurso.

**Características**:
- Lista de participantes
- Inscripción de nuevos participantes
- Gestión de perfiles
- Estadísticas de participación

**Propiedades**:
```typescript
interface ConcursantesComponent {
  participants: ProfileContest[];
  contest: Contest;
  loading: boolean;
  canManage: boolean;
}
```

### FotografiasComponent
**Archivo**: `src/app/concursos/concurso-detail/fotografias/fotografias.component.ts`

**Propósito**: Gestión de fotografías del concurso.

**Características**:
- Galería de fotografías
- Filtros por sección y participante
- Vista de detalle de imágenes
- Gestión de fotografías (admin)

**Propiedades**:
```typescript
interface FotografiasComponent {
  images: Image[];
  filteredImages: Image[];
  sections: Section[];
  participants: Profile[];
  selectedSection: number;
  selectedParticipant: number;
  viewMode: 'grid' | 'list';
}
```

### JuecesComponent
**Archivo**: `src/app/concursos/concurso-detail/jueces/jueces.component.ts`

**Propósito**: Gestión de jueces del concurso.

**Características**:
- Lista de jueces asignados
- Asignación de nuevos jueces
- Gestión de permisos
- Estadísticas de juzgamiento

### JuzgamientoComponent
**Archivo**: `src/app/concursos/concurso-detail/juzgamiento/juzgamiento.component.ts`

**Propósito**: Sistema de evaluación y juzgamiento.

**Características**:
- Evaluación de fotografías
- Sistema de puntuación
- Resultados y rankings
- Reportes de evaluación

### ImagePostPage
**Archivo**: `src/app/concursos/concurso-detail/image-post/image-post.page.ts`

**Propósito**: Formulario para subir nuevas fotografías.

**Características**:
- Upload de imágenes
- Validación de archivos
- Metadatos de fotografía
- Integración con ImageService

**Propiedades**:
```typescript
interface ImagePostPage {
  imageForm: FormGroup;
  selectedFile: File;
  previewUrl: string;
  loading: boolean;
  contest: Contest;
}
```

### ImageReviewPage
**Archivo**: `src/app/concursos/concurso-detail/image-review/image-review.page.ts`

**Propósito**: Vista detallada de una fotografía específica.

**Características**:
- Vista ampliada de imagen
- Información del autor
- Comentarios y evaluaciones
- Navegación entre imágenes

### InscribirConcursanteComponent
**Archivo**: `src/app/concursos/concurso-detail/inscribir-concursante/inscribir-concursante.component.ts`

**Propósito**: Modal para inscribir participantes al concurso.

**Características**:
- Búsqueda de perfiles
- Selección de secciones
- Validación de inscripción
- Confirmación de participación

### InscribirJuecesComponent
**Archivo**: `src/app/concursos/concurso-detail/inscribir-jueces/inscribir-jueces.component.ts`

**Propósito**: Modal para asignar jueces al concurso.

**Características**:
- Búsqueda de usuarios
- Asignación de roles de juez
- Gestión de permisos
- Confirmación de asignación

### VerFotografiasComponent
**Archivo**: `src/app/concursos/concurso-detail/ver-fotografias/ver-fotografias.component.ts`

**Propósito**: Galería completa de fotografías del concurso.

**Características**:
- Vista de galería
- Filtros avanzados
- Navegación por imágenes
- Información de autoría

## 👤 Módulo de Usuarios (UsuarioModule)

### UsuarioPage
**Archivo**: `src/app/usuario/usuario.page.ts`

**Propósito**: Página principal de gestión de perfil de usuario.

**Características**:
- Edición de perfil personal
- Cambio de contraseña
- Información de cuenta
- Preferencias de usuario

### PerfilPage
**Archivo**: `src/app/usuario/perfil/perfil.page.ts`

**Propósito**: Visualización de perfil de usuario específico.

**Características**:
- Información pública del perfil
- Historial de participación
- Estadísticas personales
- Galería de trabajos

### UsuariosAbmPage
**Archivo**: `src/app/usuario/usuarios-abm/usuarios-abm.page.ts`

**Propósito**: Administración de usuarios del sistema.

**Características**:
- Lista de usuarios
- Creación y edición
- Gestión de roles
- Búsqueda y filtros

**Propiedades**:
```typescript
interface UsuariosAbmPage {
  users: User[];
  filteredUsers: User[];
  roles: Role[];
  loading: boolean;
  searchTerm: string;
}
```

### UsuarioPostPage
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/usuario-post.page.ts`

**Propósito**: Formulario para crear y editar usuarios.

**Características**:
- Formulario completo de usuario
- Validación de campos
- Gestión de roles y permisos
- Integración con UserService

**Propiedades**:
```typescript
interface UsuarioPostPage {
  userForm: FormGroup;
  user: User;
  roles: Role[];
  profiles: Profile[];
  isEditMode: boolean;
  loading: boolean;
}
```

### ChangePasswordComponent
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/change-password/change-password.component.ts`

**Propósito**: Modal para cambio de contraseña.

**Características**:
- Formulario de cambio de contraseña
- Validación de contraseña actual
- Confirmación de nueva contraseña
- Integración con UserService

### ConfirmUserComponent
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/confirm-user/confirm-user.component.ts`

**Propósito**: Confirmación de registro de usuario.

**Características**:
- Confirmación de datos
- Activación de cuenta
- Redirección post-registro

## 📰 Módulo de Información del Centro (InfoCentroModule)

### InfoCentroPage
**Archivo**: `src/app/info-centro/info-centro.page.ts`

**Propósito**: Página principal de información del centro fotográfico.

**Características**:
- Información general del centro
- Secciones informativas
- Gestión de contenido (admin)
- Navegación por secciones

### InfoCentroPostComponent
**Archivo**: `src/app/info-centro/info-centro-post/info-centro-post.component.ts`

**Propósito**: Formulario para crear y editar contenido informativo.

**Características**:
- Editor de contenido
- Gestión de imágenes
- Categorización de contenido
- Integración con InfoCentroService

### PresentacionComisionDirectivaComponent
**Archivo**: `src/app/info-centro/presentacion-comision-directiva/presentacion-comision-directiva.component.ts`

**Propósito**: Presentación de la comisión directiva.

**Características**:
- Lista de miembros directivos
- Información de contacto
- Cargos y responsabilidades
- Imágenes de perfil

### PresentacionMiembrosComponent
**Archivo**: `src/app/info-centro/presentacion-miembros/presentacion-miembros.component.ts`

**Propósito**: Presentación de miembros del centro.

**Características**:
- Lista de miembros
- Información de contacto
- Categorías de membresía
- Galería de perfiles

### PresentacionUltimoConcursoComponent
**Archivo**: `src/app/info-centro/presentacion-ultimo-concurso/presentacion-ultimo-concurso.component.ts`

**Propósito**: Presentación del último concurso realizado.

**Características**:
- Información del concurso
- Ganadores destacados
- Galería de imágenes
- Estadísticas del evento

## 🏢 Módulo de Organizaciones (FotoclubsAbmModule)

### FotoclubsAbmPage
**Archivo**: `src/app/fotoclubs-abm/fotoclubs-abm.page.ts`

**Propósito**: Administración de organizaciones/fotoclubs.

**Características**:
- Lista de organizaciones
- Creación y edición
- Gestión de información
- Búsqueda y filtros

### FotoclubPostComponent
**Archivo**: `src/app/fotoclubs-abm/fotoclub-post/fotoclub-post.component.ts`

**Propósito**: Formulario para crear y editar organizaciones.

**Características**:
- Formulario completo de organización
- Gestión de información de contacto
- Redes sociales
- Imágenes de perfil

## 🔧 Componentes Compartidos (SharedModule)

### UsuarioImgComponent
**Archivo**: `src/app/shared/usuario-img/usuario-img.component.ts`

**Propósito**: Componente para mostrar imagen de usuario con fallback.

**Propiedades**:
```typescript
interface UsuarioImgComponent {
  @Input() userId: number;
  @Input() size: 'small' | 'medium' | 'large';
  @Input() alt: string;
}
```

**Uso**:
```html
<app-usuario-img [userId]="123" size="medium" alt="Foto de usuario"></app-usuario-img>
```

### SearchBarComponent
**Archivo**: `src/app/shared/search-bar/search-bar.component.ts`

**Propósito**: Barra de búsqueda reutilizable.

**Propiedades**:
```typescript
interface SearchBarComponent {
  @Input() placeholder: string;
  @Input() searchTerm: string;
  @Output() searchChange: EventEmitter<string>;
  @Output() searchSubmit: EventEmitter<string>;
}
```

**Uso**:
```html
<app-search-bar 
  placeholder="Buscar concursos..."
  [searchTerm]="searchTerm"
  (searchChange)="onSearchChange($event)"
  (searchSubmit)="onSearchSubmit($event)">
</app-search-bar>
```

### MenuAccionesComponent
**Archivo**: `src/app/shared/menu-acciones/menu-acciones.component.ts`

**Propósito**: Menú de acciones contextuales.

**Propiedades**:
```typescript
interface MenuAccionesComponent {
  @Input() actions: MenuAccion[];
  @Input() item: any;
  @Output() actionClick: EventEmitter<MenuAccionClick>;
}
```

**Uso**:
```html
<app-menu-acciones 
  [actions]="availableActions"
  [item]="selectedItem"
  (actionClick)="onActionClick($event)">
</app-menu-acciones>
```

### InputOjoComponent
**Archivo**: `src/app/shared/input-ojo/input-ojo.component.ts`

**Propósito**: Input de contraseña con toggle de visibilidad.

**Propiedades**:
```typescript
interface InputOjoComponent {
  @Input() placeholder: string;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
}
```

**Uso**:
```html
<app-input-ojo 
  placeholder="Contraseña"
  [(value)]="password">
</app-input-ojo>
```

### BtnSortComponent
**Archivo**: `src/app/shared/btn-sort/btn-sort.component.ts`

**Propósito**: Botón de ordenamiento con estados.

**Propiedades**:
```typescript
interface BtnSortComponent {
  @Input() field: string;
  @Input() currentSort: string;
  @Input() currentOrder: 'asc' | 'desc';
  @Output() sortChange: EventEmitter<SortEvent>;
}
```

### ThSortComponent
**Archivo**: `src/app/shared/th-sort/th-sort.component.ts`

**Propósito**: Header de tabla con ordenamiento.

**Propiedades**:
```typescript
interface ThSortComponent {
  @Input() field: string;
  @Input() label: string;
  @Input() currentSort: string;
  @Input() currentOrder: 'asc' | 'desc';
  @Output() sortChange: EventEmitter<SortEvent>;
}
```

### BtnPostComponent
**Archivo**: `src/app/shared/btn-post/btn-post.component.ts`

**Propósito**: Botón de acción principal (crear/editar).

**Propiedades**:
```typescript
interface BtnPostComponent {
  @Input() text: string;
  @Input() icon: string;
  @Input() disabled: boolean;
  @Output() click: EventEmitter<void>;
}
```

### ContestStatusChipComponent
**Archivo**: `src/app/shared/contest-status-chip/contest-status-chip.component.ts`

**Propósito**: Chip para mostrar estado de concurso.

**Propiedades**:
```typescript
interface ContestStatusChipComponent {
  @Input() status: 'active' | 'inactive' | 'judged' | 'closed';
  @Input() showText: boolean;
}
```

### SearchSelectComponent
**Archivo**: `src/app/shared/search-select/search-select.component.ts`

**Propósito**: Selector con búsqueda integrada.

**Propiedades**:
```typescript
interface SearchSelectComponent {
  @Input() items: any[];
  @Input() placeholder: string;
  @Input() value: any;
  @Input() itemText: string;
  @Input() itemValue: string;
  @Output() valueChange: EventEmitter<any>;
  @Output() searchChange: EventEmitter<string>;
}
```

## 🧭 Componentes de Navegación (NavModule)

### NavbarComponent
**Archivo**: `src/app/nav/navbar/navbar.component.ts`

**Propósito**: Barra de navegación superior.

**Características**:
- Logo y título
- Menú de navegación
- Información de usuario
- Botones de acción

### SidebarComponent
**Archivo**: `src/app/nav/sidebar/sidebar.component.ts`

**Propósito**: Menú lateral para dispositivos móviles.

**Características**:
- Navegación principal
- Información de usuario
- Accesos rápidos
- Responsive design

### FooterComponent
**Archivo**: `src/app/nav/footer/footer.component.ts`

**Propósito**: Pie de página de la aplicación.

**Características**:
- Información de contacto
- Enlaces útiles
- Información legal
- Redes sociales

### FooterPostComponent
**Archivo**: `src/app/nav/footer/footer-post/footer-post.component.ts`

**Propósito**: Formulario para editar información del footer.

**Características**:
- Edición de contenido del footer
- Gestión de enlaces
- Información de contacto
- Integración con servicios

## 📱 Componentes Responsive

### ResponsiveService
**Archivo**: `src/app/services/ui/responsive.service.ts`

**Propósito**: Servicio para manejar responsive design.

**Métodos**:
- `isDesktop()`: Verifica si es vista desktop
- `isMobile()`: Verifica si es vista móvil
- `isTablet()`: Verifica si es vista tablet
- `getScreenSize()`: Obtiene tamaño de pantalla

### UiUtilsService
**Archivo**: `src/app/services/ui/ui-utils.service.ts`

**Propósito**: Utilidades para interfaz de usuario.

**Métodos**:
- `showLoading()`: Muestra indicador de carga
- `hideLoading()`: Oculta indicador de carga
- `showAlert()`: Muestra alerta
- `showToast()`: Muestra toast

## 🔄 Ciclo de Vida de Componentes

### Hooks Principales
```typescript
// Inicialización
ngOnInit() {
  // Lógica de inicialización
}

// Cambios de input
ngOnChanges(changes: SimpleChanges) {
  // Manejo de cambios de propiedades
}

// Destrucción
ngOnDestroy() {
  // Limpieza de recursos
}
```

### Patrones de Uso
```typescript
// Ejemplo de componente con suscripciones
export class ExampleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Manejo de datos
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🎨 Estilos y Temas

### Variables CSS
```scss
// Variables de color
--ion-color-primary: #3880ff;
--ion-color-secondary: #3dc2ff;
--ion-color-tertiary: #5260ff;

// Variables de espaciado
--ion-padding: 16px;
--ion-margin: 16px;

// Variables de tipografía
--ion-font-family: 'Roboto', sans-serif;
```

### Clases Utilitarias
```scss
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }

.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
```

## 🧪 Testing de Componentes

### Estructura de Tests
```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Testing de Inputs/Outputs
```typescript
it('should emit value on input change', () => {
  const spy = jasmine.createSpy('valueChange');
  component.valueChange.subscribe(spy);
  
  component.onInputChange('new value');
  
  expect(spy).toHaveBeenCalledWith('new value');
});
```

## 📋 Checklist de Componentes

### Antes de Crear un Componente
- [ ] Definir propósito y responsabilidades
- [ ] Identificar inputs y outputs
- [ ] Planificar ciclo de vida
- [ ] Considerar reutilización
- [ ] Definir estilos y responsive design

### Durante el Desarrollo
- [ ] Implementar lógica de negocio
- [ ] Agregar validaciones
- [ ] Manejar errores
- [ ] Implementar responsive design
- [ ] Agregar tests unitarios

### Antes del Deploy
- [ ] Revisar performance
- [ ] Verificar accesibilidad
- [ ] Testear en diferentes dispositivos
- [ ] Documentar cambios
- [ ] Actualizar esta documentación

---

*Esta documentación se actualiza automáticamente con cada cambio en los componentes del sistema.* 