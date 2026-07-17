# Documentación de Componentes - Grupo Fotográfico Centro

## Descripción General

Esta documentación describe todos los componentes de la aplicación. Todos son **standalone components** (Angular 21), organizados por área funcional.

## Estructura de Componentes

```
AppComponent (standalone)
├── NavbarComponent
├── SidebarComponent
└── RouterOutlet
    ├── Concursos (páginas + detail children)
    ├── Auth (login, SSO, password recovery)
    ├── Usuario (perfil, ABM)
    ├── InfoCentro (home, comisión, miembros)
    ├── FotoclubsAbm (organizaciones)
    ├── Herramientas (búsqueda, carga resultados)
    ├── Notificaciones
    ├── Política Privacidad
    └── Condiciones Servicio
```

## Autenticación

### LoginViewComponent
**Archivo**: `src/app/modules/auth/components/login-view/login-view.component.ts`

Propósito: Formulario de inicio de sesión con soporte SSO.

Características:
- Formulario reactivo con validación
- Integración con AuthService
- Botón de login SSO
- Manejo de errores
- Redirección post-login

### LoginRedirectComponent
**Archivo**: `src/app/modules/auth/components/login-redirect/login-redirect.component.ts`

Propósito: Manejador de redirect post-autenticación SSO. Procesa el token recibido y redirige a la ruta correspondiente.

### RecuperarPasswordSolicitudComponent
**Archivo**: `src/app/modules/auth/components/recuperar-password/recuperar-password-solicitud.component.ts`

Propósito: Formulario para solicitar recuperación de contraseña (ingreso de email).

### RecuperarPasswordCodigoComponent
**Archivo**: `src/app/modules/auth/components/recuperar-password/recuperar-password-codigo.component.ts`

Propósito: Ingreso del código de verificación recibido por email.

### RecuperarPasswordExitoComponent
**Archivo**: `src/app/modules/auth/components/recuperar-password/recuperar-password-exito.component.ts`

Propósito: Confirmación de que la contraseña fue restablecida exitosamente.

## Concursos

### ConcursosPage
**Archivo**: `src/app/concursos/concursos.page.ts`

Propósito: Lista de todos los concursos con búsqueda, filtros y ordenamiento.

Características:
- Lista con búsqueda y filtros por estado/año
- Acciones CRUD para administradores
- Botón de foto del año
- Integración con ContestService

### ConcursoPostPage
**Archivo**: `src/app/concursos/concurso-post/concurso-post.page.ts`

Propósito: Formulario para crear/editar concursos (reutilizado para ambas operaciones).

### ConcursoDetailPage
**Archivo**: `src/app/concursos/concurso-detail/concurso-detail.page.ts`

Propósito: Página de detalle de concurso con navegación por tabs hijos.

Tabs disponibles:
- Información (default)
- Concursantes
- Fotografías

Dependencias: 15+ servicios inyectados (pendiente de refactor).

### InformacionComponent
**Archivo**: `src/app/concursos/concurso-detail/informacion/informacion.component.ts`

Propósito: Información general del concurso, fechas, reglas y acciones administrativas.

### ConcursantesComponent
**Archivo**: `src/app/concursos/concurso-detail/concursantes/concursantes.component.ts`

Propósito: Gestión de participantes del concurso (lista, inscripción).

### FotografiasComponent
**Archivo**: `src/app/concursos/concurso-detail/fotografias/fotografias.component.ts`

Propósito: Galería de fotografías con filtros por sección, participante y ordenamiento.

### FiltrosOrdenModalComponent
**Archivo**: `src/app/concursos/concurso-detail/fotografias/filtros-orden-modal.component.ts`

Propósito: Modal para configurar filtros y orden de visualización de fotografías.

### ImagePostPage
**Archivo**: `src/app/concursos/concurso-detail/image-post/image-post.page.ts`

Propósito: Formulario para subir nuevas fotografías a un concurso.

### ImageReviewPage
**Archivo**: `src/app/concursos/concurso-detail/image-review/image-review.page.ts`

Propósito: Vista detallada de una fotografía con información del autor y metadatos.

### InscribirConcursanteComponent
**Archivo**: `src/app/concursos/concurso-detail/inscribir-concursante/inscribir-concursante.component.ts`

Propósito: Modal para inscribir participantes al concurso (búsqueda de perfiles, selección de secciones).

### InscribirJuecesComponent
**Archivo**: `src/app/concursos/concurso-detail/inscribir-jueces/inscribir-jueces.component.ts`

Propósito: Modal para asignar jueces al concurso.

### VerFotografiasComponent
**Archivo**: `src/app/concursos/concurso-detail/ver-fotografias/ver-fotografias.component.ts`

Propósito: Galería completa de fotografías del concurso con vista ampliada.

### ContestRecordsComponent
**Archivo**: `src/app/concursos/concurso-detail/contest-records/contest-records.component.ts`

Propósito: Gestión de registros y documentos asociados al concurso.

### ContestRecordFormComponent
**Archivo**: `src/app/concursos/concurso-detail/contest-records/contest-record-form/contest-record-form.component.ts`

Propósito: Formulario para crear/editar registros del concurso.

### SeccionesAbmPage
**Archivo**: `src/app/concursos/secciones-abm/secciones-abm.page.ts`

Propósito: Administración de secciones de concursos (ABM).

### SeccionPostComponent
**Archivo**: `src/app/concursos/secciones-abm/seccion-post/seccion-post.component.ts`

Propósito: Formulario para crear/editar secciones.

### MetricasAbmPage
**Archivo**: `src/app/concursos/metricas-abm/metricas-abm.page.ts`

Propósito: Administración de métricas de evaluación (ABM).

### MetricasPostComponent
**Archivo**: `src/app/concursos/metricas-abm/metricas-post/metricas-post.component.ts`

Propósito: Formulario para crear/editar métricas.

### RankingPage
**Archivo**: `src/app/concursos/ranking/ranking.page.ts`

Propósito: Ranking de participantes con filtros por año y concurso.

### RankingDetalleModalComponent
**Archivo**: `src/app/concursos/ranking/ranking-detalle-modal/ranking-detalle-modal.component.ts`

Propósito: Modal con detalle del ranking de un participante (categorías, secciones, puntajes).

### FotosAnioCardComponent
**Archivo**: `src/app/concursos/fotos-anio-card/fotos-anio-card.component.ts`

Propósito: Card para mostrar/seleccionar foto del año.

## Usuarios

### UsuarioPage
**Archivo**: `src/app/usuario/usuario.page.ts`

Propósito: Edición del perfil del usuario actual.

### PerfilPage
**Archivo**: `src/app/usuario/perfil/perfil.page.ts`

Propósito: Visualización de perfil de usuario (propio o de otros).

### UsuariosAbmPage
**Archivo**: `src/app/usuario/usuarios-abm/usuarios-abm.page.ts`

Propósito: Administración de usuarios del sistema (lista, búsqueda, roles).

### UsuarioPostPage
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/usuario-post.page.ts`

Propósito: Formulario para crear/editar usuarios (reutilizado para registro y admin).

### ChangePasswordComponent
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/change-password/change-password.component.ts`

Propósito: Modal para cambio de contraseña.

### ConfirmUserComponent
**Archivo**: `src/app/usuario/usuarios-abm/usuario-post/confirm-user/confirm-user.component.ts`

Propósito: Confirmación de registro de usuario.

## Información del Centro

### InfoCentroPage
**Archivo**: `src/app/info-centro/info-centro.page.ts`

Propósito: Página principal del centro (home pública).

### InfoCentroPostComponent
**Archivo**: `src/app/info-centro/info-centro-post/info-centro-post.component.ts`

Propósito: Formulario para crear/editar contenido informativo.

### PresentacionComisionDirectivaComponent
**Archivo**: `src/app/info-centro/presentacion-comision-directiva/presentacion-comision-directiva.component.ts`

Propósito: Presentación de la comisión directiva.

### PresentacionMiembrosComponent
**Archivo**: `src/app/info-centro/presentacion-miembros/presentacion-miembros.component.ts`

Propósito: Presentación de miembros del centro.

### PresentacionUltimoConcursoComponent
**Archivo**: `src/app/info-centro/presentacion-ultimo-concurso/presentacion-ultimo-concurso.component.ts`

Propósito: Presentación del último concurso realizado.

## Organizaciones

### FotoclubsAbmPage
**Archivo**: `src/app/fotoclubs-abm/fotoclubs-abm.page.ts`

Propósito: Lista de organizaciones/fotoclubs (pública).

### FotoclubPostComponent
**Archivo**: `src/app/fotoclubs-abm/fotoclub-post/fotoclub-post.component.ts`

Propósito: Formulario para crear/editar organizaciones.

## Herramientas

### HerramientasPage
**Archivo**: `src/app/herramientas/herramientas.page.ts`

Propósito: Panel principal de herramientas administrativas.

### BusquedaFotografiasPage
**Archivo**: `src/app/herramientas/busqueda-fotografias/busqueda-fotografias.page.ts`

Propósito: Búsqueda avanzada de fotografías con múltiples filtros.

### CargaResultadosPage
**Archivo**: `src/app/herramientas/carga-resultados/carga-resultados.page.ts`

Propósito: Importación de resultados de concursos desde archivos Excel.

## Notificaciones

### NotificacionesPage
**Archivo**: `src/app/notificaciones/notificaciones.page.ts`

Propósito: Centro de notificaciones del usuario.

## Páginas Legales

### PoliticaPrivacidadComponent
**Archivo**: `src/app/politica-privacidad/politica-privacidad.component.ts`

Propósito: Página de política de privacidad (pública, standalone eager).

### CondicionesServicioComponent
**Archivo**: `src/app/condiciones-servicio/condiciones-servicio.component.ts`

Propósito: Página de condiciones de servicio (pública, standalone eager).

## Componentes Compartidos (Shared)

### UsuarioImgComponent
**Archivo**: `src/app/shared/usuario-img/usuario-img.component.ts`

Propósito: Imagen de perfil con fallback.

```html
<app-usuario-img [userId]="123" size="medium" alt="Foto"></app-usuario-img>
```

### SearchBarComponent
**Archivo**: `src/app/shared/search-bar/search-bar.component.ts`

Propósito: Barra de búsqueda reutilizable con emit de cambios y submit.

### MenuAccionesComponent
**Archivo**: `src/app/shared/menu-acciones/menu-acciones.component.ts`

Propósito: Menú contextual de acciones (editar, eliminar, etc.).

### InputOjoComponent
**Archivo**: `src/app/shared/input-ojo/input-ojo.component.ts`

Propósito: Input de contraseña con toggle de visibilidad.

### BtnSortComponent
**Archivo**: `src/app/shared/btn-sort/btn-sort.component.ts`

Propósito: Botón de ordenamiento con estados asc/desc.

### ThSortComponent
**Archivo**: `src/app/shared/th-sort/th-sort.component.ts`

Propósito: Header de tabla con indicador de ordenamiento.

### BtnPostComponent
**Archivo**: `src/app/shared/btn-post/btn-post.component.ts`

Propósito: Botón de acción principal con ícono y texto.

### SearchableSelectComponent
**Archivo**: `src/app/shared/searchable-select/searchable-select.component.ts`

Propósito: Selector con búsqueda integrada (filtrado de opciones).

### SlidesComponent
**Archivo**: `src/app/shared/slides/slides.component.ts`

Propósito: Carrusel de imágenes para galerías.

## Directivas

### InfiniteScrollDirective
**Archivo**: `src/app/shared/infinite-scroll.directive.ts`

Propósito: Directiva de scroll infinito para carga paginada.

## Navegación

### NavbarComponent
**Archivo**: `src/app/nav/navbar/navbar.component.ts`

Propósito: Barra de navegación superior con logo, menú y toggle de sidebar.

### SidebarComponent
**Archivo**: `src/app/nav/sidebar/sidebar.component.ts`

Propósito: Menú lateral con navegación principal, información de usuario y enlaces.

## Utilidades

### ErrorUtils
**Archivo**: `src/app/shared/error-utils.ts`

Funciones utilitarias para normalización de mensajes de error.

### FocusUtils
**Archivo**: `src/app/shared/focus-utils.ts`

Utilidades para manejo de foco y accesibilidad.

## AppComponent (Raíz)

**Archivo**: `src/app/app.component.ts`

```html
<a href="#main-content" class="visually-hidden-focusable">Saltar al contenido principal</a>
<div class="d-flex flex-column vh-100">
  <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>
  <app-sidebar [open]="sidebarOpen" (closeSidebar)="sidebarOpen = false"></app-sidebar>
  <main class="flex-grow-1 overflow-auto" id="main-content">
    <router-outlet></router-outlet>
  </main>
</div>
```

Características:
- Skip-to-content link para accesibilidad
- Layout flexbox vertical (vh-100)
- Navbar + Sidebar + RouterOutlet
- Inicialización de tema oscuro y console.error interceptor

## Folder (Legacy)
**Archivo**: `src/app/folder/folder.page.ts`

Componente legacy del template original Ionic. Sin uso activo.

---

*Última actualización: Julio 2026*
