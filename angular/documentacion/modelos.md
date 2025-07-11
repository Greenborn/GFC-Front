# Documentación de Modelos - Grupo Fotográfico Centro

## 📋 Descripción General

Esta documentación describe todos los modelos de datos de la aplicación, incluyendo interfaces, tipos y estructuras de datos utilizadas en el sistema.

## 🏗️ Estructura de Modelos

### Jerarquía de Modelos
```
Base Models
├── User & Auth Models
├── Contest Models
├── Profile Models
├── Image Models
├── Organization Models
└── Utility Models
```

### Convenciones de Nomenclatura
- **Interfaces**: PascalCase (ej: `Contest`, `User`)
- **Tipos**: PascalCase con sufijo `Type` (ej: `ContestStatusType`)
- **Enums**: PascalCase (ej: `UserRole`, `ContestStatus`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_FILE_SIZE`)

## 👤 Modelos de Usuario y Autenticación

### User
**Archivo**: `src/app/models/user.model.ts`

**Descripción**: Modelo principal de usuario del sistema.

```typescript
export interface User {
  id?: number;
  username: string;
  password?: string;
  role_id: number;
  profile_id: number;
  email?: string;
  passwordRepeat?: string;
  role?: Role;
  dni?: string;
}

export interface UserLogged {
  id: number;
  username: string;
  email: string;
  role: Role;
  profile: ProfileExpanded;
  token: string;
  expires_at: string;
}
```

**Propiedades**:
- `id`: Identificador único del usuario
- `username`: Nombre de usuario para login
- `password`: Contraseña (opcional en respuestas)
- `role_id`: ID del rol del usuario
- `profile_id`: ID del perfil asociado
- `email`: Email del usuario
- `role`: Objeto Role expandido
- `dni`: Número de documento

### Role
**Archivo**: `src/app/models/role.model.ts`

**Descripción**: Modelo de roles de usuario.

```typescript
export interface Role {
  id?: number;
  type: string;
}
```

**Tipos de Rol**:
- `admin`: Administrador del sistema
- `user`: Usuario regular
- `judge`: Juez de concursos

### Profile
**Archivo**: `src/app/models/profile.model.ts`

**Descripción**: Modelo de perfil de usuario.

```typescript
export interface Profile {
  id?: number;
  name: string;
  last_name: string;
  fotoclub_id: number;
  img_url?: string;
  executive?: number;
  executive_rol?: string;
  dni?: string;
}

export interface ProfileExpanded extends Profile {
  fotoclub?: Fotoclub;
  user?: User;
  contest_participations?: ProfileContest[];
  images?: Image[];
  statistics?: Stadistics;
}
```

**Propiedades**:
- `id`: Identificador único del perfil
- `name`: Nombre del usuario
- `last_name`: Apellido del usuario
- `fotoclub_id`: ID del fotoclub al que pertenece
- `img_url`: URL de la imagen de perfil
- `executive`: Indica si es ejecutivo (0/1)
- `executive_rol`: Rol ejecutivo específico
- `dni`: Número de documento

## 🏆 Modelos de Concursos

### Contest
**Archivo**: `src/app/models/contest.model.ts`

**Descripción**: Modelo principal de concurso fotográfico.

```typescript
export interface Contest {
  id?: number;
  name: string;
  description: string;
  start_date: any;
  end_date: any;
  max_img_section: number;
  img_url?: string;
  rules_url?: string;
  active?: boolean;
  countProfileContests?: number;
  countContestResults?: number;
  sections?: Section[];
  categories?: Category[];
  contestRecords?: any[];
  sub_title?: string;
  judged?: Boolean;
}

export interface ContestExpanded extends Contest {
  sections?: ContestSectionExpanded[];
  categories?: ContestCategoryExpanded[];
  participants?: ProfileContestExpanded[];
  results?: ContestResultExpanded[];
  statistics?: ContestStatistics;
}
```

**Propiedades**:
- `id`: Identificador único del concurso
- `name`: Nombre del concurso
- `description`: Descripción detallada
- `start_date`: Fecha de inicio
- `end_date`: Fecha de finalización
- `max_img_section`: Máximo de imágenes por sección
- `img_url`: URL de la imagen del concurso
- `rules_url`: URL de las reglas
- `active`: Estado activo del concurso
- `judged`: Indica si ya fue juzgado

### ContestSection
**Archivo**: `src/app/models/contest_section.model.ts`

**Descripción**: Modelo de secciones de concurso.

```typescript
export interface ContestSection {
  id?: number;
  contest_id: number;
  section_id: number;
  max_images: number;
  description?: string;
}

export interface ContestSectionExpanded extends ContestSection {
  section?: Section;
  contest?: Contest;
  images?: Image[];
  results?: ContestResult[];
}
```

### ContestCategory
**Archivo**: `src/app/models/contest_category.model.ts`

**Descripción**: Modelo de categorías de concurso.

```typescript
export interface ContestCategory {
  id?: number;
  contest_id: number;
  category_id: number;
  description?: string;
}

export interface ContestCategoryExpanded extends ContestCategory {
  category?: Category;
  contest?: Contest;
}
```

### ContestResult
**Archivo**: `src/app/models/contest_result.model.ts`

**Descripción**: Modelo de resultados de concurso.

```typescript
export interface ContestResult {
  id?: number;
  contest_id: number;
  image_id: number;
  metric_id: number;
  section_id: number;
  score?: number;
  prize?: string;
  mention?: string;
}

export interface ContestResultExpanded extends ContestResult {
  contest?: Contest;
  image?: Image;
  metric?: Metric;
  section?: Section;
  profile?: Profile;
}
```

### ContestRecord
**Archivo**: `src/app/concursos/concurso-detail/contest-records/models/contest.record.ts`

**Descripción**: Modelo de registros/documentos de concurso.

```typescript
export interface ContestRecord {
  id?: number;
  url?: string;
  object?: any;
  contest_id: number;
  title?: string;
  description?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
}
```

### ProfileContest
**Archivo**: `src/app/models/profile_contest.ts`

**Descripción**: Modelo de participación de perfil en concurso.

```typescript
export interface ProfileContest {
  id?: number;
  profile_id: number;
  contest_id: number;
  sections?: number[];
  status?: string;
  registered_at?: string;
}

export interface ProfileContestExpanded extends ProfileContest {
  profile?: ProfileExpanded;
  contest?: ContestExpanded;
  sections_data?: Section[];
  images?: Image[];
  results?: ContestResult[];
}
```

## 📸 Modelos de Imágenes

### Image
**Archivo**: `src/app/models/image.model.ts`

**Descripción**: Modelo de imagen/fotografía.

```typescript
export interface Image {
  id?: number;
  code: string;
  title: string;
  profile_id: number;
  url: string;
  photo_base64?: string;
  section_id?: number;
  contest_id?: number;
  description?: string;
  technical_data?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImageExpanded extends Image {
  profile?: ProfileExpanded;
  section?: Section;
  contest?: Contest;
  results?: ContestResult[];
  metadata?: ImageMetadata;
}
```

**Propiedades**:
- `id`: Identificador único de la imagen
- `code`: Código único de la imagen
- `title`: Título de la imagen
- `profile_id`: ID del autor
- `url`: URL de la imagen
- `photo_base64`: Imagen en base64 (para upload)
- `section_id`: ID de la sección
- `contest_id`: ID del concurso
- `description`: Descripción de la imagen
- `technical_data`: Datos técnicos de la foto

### ImageMetadata
**Descripción**: Metadatos de imagen EXIF.

```typescript
export interface ImageMetadata {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter_speed?: string;
  iso?: number;
  focal_length?: string;
  date_taken?: string;
  location?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
}
```

### CompressedPhotos
**Archivo**: `src/app/models/compressed_photos.model.ts`

**Descripción**: Modelo para descargas comprimidas.

```typescript
export interface CompressedPhotos {
  download_url?: string;
  file_size?: number;
  created_at?: string;
  contest_id?: number;
}
```

## 🏢 Modelos de Organizaciones

### Fotoclub
**Archivo**: `src/app/models/fotoclub.model.ts`

**Descripción**: Modelo de organización/fotoclub.

```typescript
export interface Fotoclub {
  id?: number;
  name: string;
  description?: string;
  facebook?: string;
  instagram?: string;
  email?: string;
  photo_url?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FotoclubExpanded extends Fotoclub {
  members?: Profile[];
  contests?: Contest[];
  statistics?: FotoclubStatistics;
}
```

**Propiedades**:
- `id`: Identificador único del fotoclub
- `name`: Nombre de la organización
- `description`: Descripción de la organización
- `facebook`: URL de Facebook
- `instagram`: URL de Instagram
- `email`: Email de contacto
- `photo_url`: URL de la imagen del fotoclub
- `website`: Sitio web oficial
- `phone`: Teléfono de contacto
- `address`: Dirección física
- `city`: Ciudad
- `country`: País

## 📊 Modelos de Estadísticas

### Stadistics
**Archivo**: `src/app/models/stadistics.model.ts`

**Descripción**: Modelo de estadísticas generales.

```typescript
export interface Stadistics {
  id?: number;
  concursos?: number;
  fotografias?: number;
  mencion?: number;
  primer_puesto?: number;
  segundo_puesto?: number;
  tercer_puesto?: number;
  total_participants?: number;
  total_organizations?: number;
  period?: string;
  profile_id?: number;
  fotoclub_id?: number;
  contest_id?: number;
}
```

### ContestStatistics
**Descripción**: Estadísticas específicas de concurso.

```typescript
export interface ContestStatistics {
  contest_id: number;
  total_participants: number;
  total_images: number;
  total_sections: number;
  total_categories: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  participation_rate: number;
  completion_rate: number;
}
```

### FotoclubStatistics
**Descripción**: Estadísticas específicas de fotoclub.

```typescript
export interface FotoclubStatistics {
  fotoclub_id: number;
  total_members: number;
  total_contests: number;
  total_images: number;
  total_awards: number;
  average_participation: number;
  success_rate: number;
}
```

## 🏷️ Modelos de Categorización

### Section
**Archivo**: `src/app/models/section.model.ts`

**Descripción**: Modelo de secciones fotográficas.

```typescript
export interface Section {
  id?: number;
  name: string;
  parent_id?: number | null;
  description?: string;
  max_images?: number;
  rules?: string;
}

export interface SectionExpanded extends Section {
  parent?: Section;
  children?: Section[];
  contests?: ContestSection[];
  images?: Image[];
}
```

### Category
**Archivo**: `src/app/models/category.model.ts`

**Descripción**: Modelo de categorías fotográficas.

```typescript
export interface Category {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}
```

### Metric
**Archivo**: `src/app/models/metric.model.ts`

**Descripción**: Modelo de métricas de evaluación.

```typescript
export interface Metric {
  id?: number;
  prize: string;
  score: number;
  description?: string;
  contest_id?: number;
  section_id?: number;
}
```

## 📰 Modelos de Contenido

### InfoCentro
**Archivo**: `src/app/models/info_centro.model.ts`

**Descripción**: Modelo de contenido informativo del centro.

```typescript
export interface InfoCentro {
  id?: number;
  title: string;
  content: string;
  img_url?: string;
  category?: string;
  published?: boolean;
  featured?: boolean;
  author_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InfoCentroExpanded extends InfoCentro {
  author?: Profile;
  category_data?: Category;
}
```

## 🔧 Modelos de Utilidad

### ApiConsumer
**Archivo**: `src/app/models/ApiConsumer.ts`

**Descripción**: Clase base para componentes que consumen APIs.

```typescript
export abstract class ApiConsumer implements OnDestroy {
  private readonly unsubscribe$: Subject<void> = new Subject();

  constructor(protected alertCtrl: AlertController) {}

  protected fetch<T>(callback: CallableFunction): Observable<T> {
    return callback().pipe(
      takeUntil(this.unsubscribe$)
    );
  }

  async displayAlert(message: string, header: string = 'Error') {
    (await this.alertCtrl.create({
      header: header,
      message,
      buttons: [{
        text: 'Ok',
        role: 'cancel'
      }]
    })).present();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  errorFilter(e: string): string {
    e = e.replace('ERROR:', '');
    let i: number = e.indexOf('CONTEXT') - 1;
    
    if (i == -2) return e;
    
    let aux: string = '';
    for (let c = 0; c < i; c++) {
      aux += e[c];
    }
    aux += '.';
    return aux;
  }
}
```

### ApiRequest
**Archivo**: `src/app/models/ApiRequest.ts`

**Descripción**: Modelos para requests de API.

```typescript
export interface ApiLoginBody {
  username: string;
  password: string;
}

export interface ApiChangePasswordBody {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiSignUpBody {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  profile: {
    name: string;
    last_name: string;
    fotoclub_id: number;
    dni?: string;
  };
}

export interface ApiImageUploadBody {
  title: string;
  description?: string;
  section_id: number;
  contest_id: number;
  technical_data?: string;
  photo_base64: string;
}
```

### ApiResponse
**Archivo**: `src/app/models/ApiResponse.ts`

**Descripción**: Modelos para responses de API.

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: ApiMeta;
}

export interface ApiSerializedResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
  meta?: ApiMeta;
}

export interface ApiMeta {
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserLogged;
  expires_at: string;
}
```

## 🎯 Modelos de UI

### SearchBarComponentParams
**Archivo**: `src/app/shared/search-bar/search-bar.component.ts`

**Descripción**: Parámetros para componente de búsqueda.

```typescript
export interface SearchBarComponentParams {
  placeholder?: string;
  searchTerm?: string;
  debounceTime?: number;
  minLength?: number;
  showClearButton?: boolean;
}

export interface SearchBarComponentAtributo {
  placeholder: string;
  searchTerm: string;
  debounceTime: number;
  minLength: number;
  showClearButton: boolean;
}
```

### MenuAccionesComponentAccion
**Archivo**: `src/app/shared/menu-acciones/menu-acciones.component.ts`

**Descripción**: Modelo para acciones de menú.

```typescript
export interface MenuAccion {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
  visible?: boolean;
  action: string;
  confirm?: boolean;
  confirmMessage?: string;
}

export interface MenuAccionClick {
  action: MenuAccion;
  item: any;
  event: any;
}
```

### SortEvent
**Descripción**: Modelo para eventos de ordenamiento.

```typescript
export interface SortEvent {
  field: string;
  order: 'asc' | 'desc';
}
```

## 📋 Enums y Tipos

### UserRole
**Descripción**: Roles de usuario disponibles.

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  JUDGE = 'judge'
}
```

### ContestStatus
**Descripción**: Estados de concurso.

```typescript
export enum ContestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  JUDGED = 'judged',
  ARCHIVED = 'archived'
}
```

### ImageStatus
**Descripción**: Estados de imagen.

```typescript
export enum ImageStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  JUDGED = 'judged'
}
```

### FileType
**Descripción**: Tipos de archivo permitidos.

```typescript
export enum FileType {
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_GIF = 'image/gif',
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}
```

## 🔧 Tipos de Utilidad

### PaginationParams
**Descripción**: Parámetros de paginación.

```typescript
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}
```

### FilterParams
**Descripción**: Parámetros de filtrado.

```typescript
export interface FilterParams {
  contest_id?: number;
  section_id?: number;
  category_id?: number;
  profile_id?: number;
  fotoclub_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}
```

### SearchParams
**Descripción**: Parámetros de búsqueda.

```typescript
export interface SearchParams {
  query: string;
  type?: 'contests' | 'users' | 'images' | 'all';
  filters?: FilterParams;
  pagination?: PaginationParams;
}
```

### UploadProgress
**Descripción**: Progreso de upload.

```typescript
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  estimatedTime?: number;
}
```

## 📊 Modelos de Reportes

### ReportParams
**Descripción**: Parámetros para generación de reportes.

```typescript
export interface ReportParams {
  type: 'contest' | 'user' | 'fotoclub' | 'general';
  format: 'pdf' | 'excel' | 'csv';
  date_from?: string;
  date_to?: string;
  filters?: FilterParams;
  include_charts?: boolean;
  include_details?: boolean;
}
```

### ReportData
**Descripción**: Datos de reporte.

```typescript
export interface ReportData {
  title: string;
  generated_at: string;
  period: string;
  summary: any;
  details: any[];
  charts?: any[];
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  total_records: number;
  filters_applied: string[];
  generated_by: string;
  version: string;
}
```

## 🔄 Modelos de Estado

### AppState
**Descripción**: Estado global de la aplicación.

```typescript
export interface AppState {
  user: UserLogged | null;
  contests: Contest[];
  currentContest: Contest | null;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications_enabled: boolean;
  auto_save: boolean;
  page_size: number;
}
```

### Notification
**Descripción**: Modelo de notificación.

```typescript
export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
}
```

## 🧪 Modelos de Testing

### MockData
**Descripción**: Datos mock para testing.

```typescript
export interface MockData {
  users: User[];
  contests: Contest[];
  profiles: Profile[];
  images: Image[];
  fotoclubs: Fotoclub[];
}

export const mockData: MockData = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role_id: 1,
      profile_id: 1
    }
  ],
  contests: [
    {
      id: 1,
      name: 'Concurso de Naturaleza 2024',
      description: 'Concurso anual de fotografía de naturaleza',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      max_img_section: 3,
      active: true
    }
  ],
  // ... más datos mock
};
```

## 📋 Validaciones

### ValidationRules
**Descripción**: Reglas de validación para formularios.

```typescript
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
}

export const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_]+$'
  },
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]'
  },
  contest_name: {
    required: true,
    minLength: 5,
    maxLength: 100
  }
};
```

## 🔮 Modelos Futuros

### Modelos Planificados
- **AuditLog**: Registro de auditoría
- **Comment**: Comentarios en imágenes
- **Rating**: Sistema de calificaciones
- **Tag**: Sistema de etiquetas
- **Album**: Álbumes de fotos
- **Event**: Eventos del centro
- **Newsletter**: Boletines informativos
- **Payment**: Sistema de pagos
- **Subscription**: Suscripciones
- **APIKey**: Claves de API

---

*Esta documentación se actualiza automáticamente con cada cambio en los modelos del sistema.* 