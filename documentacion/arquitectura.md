# Arquitectura del Sistema - Grupo Fotográfico Centro

## 📋 Descripción General

La aplicación del Grupo Fotográfico Centro es una SPA (Single Page Application) desarrollada con Angular 12 e Ionic 6, diseñada para la gestión completa de concursos fotográficos. La arquitectura sigue los principios de modularidad, separación de responsabilidades y escalabilidad.

## 🏗️ Arquitectura General

### Patrón de Arquitectura
La aplicación utiliza una arquitectura **modular** basada en Angular, siguiendo el patrón **MVC (Model-View-Controller)** adaptado al framework:

- **Model**: Representado por los servicios y modelos de datos
- **View**: Componentes de Angular/Ionic
- **Controller**: Lógica de negocio en servicios y componentes

### Capas de la Aplicación

```
┌─────────────────────────────────────┐
│           PRESENTACIÓN              │
│  (Componentes Angular/Ionic)        │
├─────────────────────────────────────┤
│           LÓGICA DE NEGOCIO         │
│        (Servicios Angular)          │
├─────────────────────────────────────┤
│           ACCESO A DATOS            │
│        (API Services)               │
├─────────────────────────────────────┤
│           COMUNICACIÓN              │
│        (HTTP Client)                │
└─────────────────────────────────────┘
```

## 📦 Estructura Modular

### Módulos Principales

#### 1. **AppModule** (Módulo Raíz)
- **Responsabilidad**: Configuración inicial de la aplicación
- **Componentes**: AppComponent, NavbarComponent, FooterComponent, SidebarComponent
- **Servicios**: Configuración global, interceptores HTTP
- **Dependencias**: Todos los módulos de la aplicación

#### 2. **AuthModule** (Autenticación)
- **Responsabilidad**: Gestión de autenticación y autorización
- **Componentes**: LoginViewComponent
- **Servicios**: AuthService, RolificadorService, AuthInterceptorService
- **Guards**: AuthGuard
- **Validadores**: Validadores de formularios de autenticación

#### 3. **ConcursosModule** (Gestión de Concursos)
- **Responsabilidad**: Gestión completa de concursos fotográficos
- **Submódulos**:
  - `concurso-detail`: Detalle y gestión de concursos específicos
  - `concurso-post`: Creación y edición de concursos
  - `secciones-abm`: Administración de secciones
  - `metricas-abm`: Administración de métricas
- **Componentes**: ConcursosPage, RankingPage, SeccionPostComponent, MetricasPostComponent

#### 4. **UsuarioModule** (Gestión de Usuarios)
- **Responsabilidad**: Gestión de usuarios y perfiles
- **Submódulos**:
  - `perfil`: Visualización y edición de perfiles
  - `usuarios-abm`: Administración de usuarios
- **Componentes**: UsuarioPage, PerfilPage, UsuariosAbmPage

#### 5. **InfoCentroModule** (Información del Centro)
- **Responsabilidad**: Gestión de contenido informativo
- **Componentes**: InfoCentroPage, InfoCentroPostComponent
- **Subcomponentes**: Presentación de comisión directiva, miembros, último concurso

#### 6. **FotoclubsAbmModule** (Organizaciones)
- **Responsabilidad**: Gestión de organizaciones/fotoclubs
- **Componentes**: FotoclubsAbmPage, FotoclubPostComponent

#### 7. **SharedModule** (Componentes Compartidos)
- **Responsabilidad**: Componentes reutilizables en toda la aplicación
- **Componentes**: 
  - UsuarioImgComponent
  - SearchBarComponent
  - MenuAccionesComponent
  - InputOjoComponent
  - BtnSortComponent
  - ThSortComponent
  - BtnPostComponent
  - ContestStatusChipComponent
  - SearchSelectComponent

## 🔄 Flujo de Datos

### 1. **Flujo de Autenticación**
```
Usuario → LoginComponent → AuthService → API → Token → LocalStorage
```

### 2. **Flujo de Datos CRUD**
```
Componente → Service → ApiService → HTTP → API → Base de Datos
```

### 3. **Flujo de Navegación**
```
Router → Guard → Componente → Service → API
```

## 🛡️ Seguridad

### Autenticación
- **JWT Tokens**: Manejo de tokens de autenticación
- **Interceptores HTTP**: Inyección automática de headers de autorización
- **Guards**: Protección de rutas basada en roles

### Autorización
- **Sistema de Roles**: Administrador, Usuario, Juez
- **Permisos Granulares**: Control de acceso por funcionalidad
- **Validación en Frontend y Backend**: Doble validación de permisos

## 📱 Responsive Design

### Estrategia de Diseño
- **Mobile-First**: Diseño optimizado para dispositivos móviles
- **Adaptive Design**: Adaptación automática a diferentes tamaños de pantalla
- **Ionic Components**: Uso de componentes nativos de Ionic para mejor experiencia móvil

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Configuración y Entornos

### Variables de Entorno
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Otras configuraciones...
};
```

### Configuración de Build
- **Web**: Angular CLI build
- **Mobile**: Capacitor build para iOS/Android
- **Optimización**: Tree shaking, minificación, compresión

## 🧪 Testing

### Estrategia de Testing
- **Unit Tests**: Jasmine + Karma
- **E2E Tests**: Protractor
- **Coverage**: Cobertura mínima del 80%

### Estructura de Tests
```
src/
├── app/
│   ├── component/
│   │   ├── component.spec.ts
│   │   └── component.ts
│   └── services/
│       ├── service.spec.ts
│       └── service.ts
```

## 📊 Rendimiento

### Optimizaciones Implementadas
- **Lazy Loading**: Carga diferida de módulos
- **Preloading**: Precarga de módulos críticos
- **OnPush Strategy**: Detección de cambios optimizada
- **TrackBy Functions**: Optimización de listas
- **Unsubscribe Pattern**: Gestión de memoria

### Métricas de Rendimiento
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔄 Estado de la Aplicación

### Gestión de Estado
- **Local State**: Estado local en componentes
- **Service State**: Estado compartido en servicios
- **RxJS**: Manejo reactivo de estado
- **Observables**: Patrón Observer para cambios de estado

### Patrones de Estado
```typescript
// Ejemplo de servicio con estado
@Injectable()
export class ContestService {
  private contests$ = new BehaviorSubject<Contest[]>([]);
  
  getContests(): Observable<Contest[]> {
    return this.contests$.asObservable();
  }
}
```

## 🚀 Escalabilidad

### Estrategias de Escalabilidad
- **Modularidad**: Módulos independientes y reutilizables
- **Micro-Frontends**: Preparado para arquitectura de micro-frontends
- **API Versioning**: Soporte para versionado de APIs
- **Feature Flags**: Implementación de feature flags para despliegues graduales

### Consideraciones Futuras
- **PWA**: Progressive Web App capabilities
- **Offline Support**: Funcionalidad offline
- **Push Notifications**: Notificaciones push
- **Real-time**: Actualizaciones en tiempo real

## 🔍 Monitoreo y Logging

### Estrategia de Logging
- **Console Logging**: Logs de desarrollo
- **Error Tracking**: Captura de errores
- **Performance Monitoring**: Monitoreo de rendimiento
- **User Analytics**: Análisis de uso

### Herramientas de Monitoreo
- **Error Tracking**: Sentry (configurable)
- **Performance**: Lighthouse CI
- **Analytics**: Google Analytics (configurable)

## 📋 Convenciones y Estándares

### Nomenclatura
- **Componentes**: PascalCase (ej: `ContestDetailComponent`)
- **Servicios**: PascalCase + Service (ej: `ContestService`)
- **Módulos**: PascalCase + Module (ej: `ContestModule`)
- **Interfaces**: PascalCase (ej: `Contest`)
- **Archivos**: kebab-case (ej: `contest-detail.component.ts`)

### Estructura de Archivos
```
component/
├── component.ts
├── component.html
├── component.scss
└── component.spec.ts
```

### Estándares de Código
- **ESLint**: Configuración de linting
- **Prettier**: Formateo de código
- **TypeScript**: Uso estricto de tipos
- **Angular Style Guide**: Seguimiento de guías de estilo de Angular

## 🔗 Dependencias Principales

### Core Dependencies
- **Angular**: 12.1.1 - Framework principal
- **Ionic**: 6.5.1 - UI Framework
- **RxJS**: 6.6.0 - Gestión reactiva
- **Axios**: 1.10.0 - Cliente HTTP
- **TypeScript**: 4.2.4 - Lenguaje de programación

### Development Dependencies
- **Angular CLI**: 12.1.1 - Herramientas de desarrollo
- **TypeScript**: 4.2.4 - Lenguaje de programación
- **Jasmine/Karma**: Testing
- **ESLint**: Linting

### Mobile Dependencies
- **Capacitor**: 3.2.2 - Framework móvil
- **Capacitor Plugins**: Funcionalidades nativas

## 📈 Métricas y KPIs

### Métricas Técnicas
- **Bundle Size**: < 2MB (gzipped)
- **Load Time**: < 3s en conexión 3G
- **Time to Interactive**: < 5s
- **Error Rate**: < 1%

### Métricas de Negocio
- **User Engagement**: Tiempo de sesión
- **Feature Adoption**: Uso de funcionalidades
- **Conversion Rate**: Tasa de conversión
- **User Satisfaction**: NPS y feedback

## 🔮 Roadmap Técnico

### Corto Plazo (1-3 meses)
- [ ] Implementación de PWA
- [ ] Optimización de rendimiento
- [ ] Mejoras en UX/UI
- [ ] Testing automatizado

### Mediano Plazo (3-6 meses)
- [ ] Funcionalidad offline
- [ ] Notificaciones push
- [ ] Real-time updates
- [ ] Analytics avanzado

### Largo Plazo (6+ meses)
- [ ] Micro-frontends
- [ ] Machine Learning features
- [ ] Integración con redes sociales
- [ ] API GraphQL

---

*Esta documentación se actualiza regularmente para reflejar los cambios en la arquitectura del sistema.* 