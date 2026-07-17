# API Clásica (apiBaseUrl) — Endpoints PHP activos

**Base URL:** `https://gfc.prod-api.greenborn.com.ar/` (producción)  
**Alternativa Dev:** `https://gfc.api.greenborn.com.ar/`

## Recursos con CRUD completo (GET, POST, PUT, DELETE)

Estos 5 servicios extienden `ApiService` sin sobrescribir métodos, por lo que heredan el CRUD completo contra `apiBaseUrl`:

| # | Recurso | Service | Archivo | GET `/recurso` | GET `/recurso/{id}` | POST `/recurso` | PUT `/recurso/{id}` | DELETE `/recurso/{id}` |
|---|---|---|---|---|---|---|---|---|
| 1 | `public-info-centro` | `PublicInfoCentroService` | `services/public.info.centro.service.ts` | Listar todos (paginado, con `_meta`) | Obtener uno por ID | Crear nuevo | Actualizar por ID | Eliminar por ID |
| 2 | `public-profile` | `PublicProfileService` | `services/public-profile.service.ts` | Listar todos (paginado, con `_meta`) | Obtener uno por ID | Crear nuevo | Actualizar por ID | Eliminar por ID |
| 3 | `info-centro` | `InfoCentroService` | `services/info-centro.service.ts` | Listar todos (paginado, con `_meta`) | Obtener uno por ID | Crear nuevo | Actualizar por ID | Eliminar por ID |
| 4 | `stadistics` | `StadisticsService` | `services/stadistics.service.ts` | Listar todos (paginado, con `_meta`) | Obtener uno por ID | Crear nuevo | Actualizar por ID | Eliminar por ID |
| 5 | `public-contest` | `PublicContestService` | `services/public.contest.service.ts` | Listar todos (paginado, con `_meta`) | Obtener uno por ID | Crear nuevo | Actualizar por ID | Eliminar por ID |

### Forma de las URLs generadas

| Método | URL | Propósito |
|---|---|---|
| `GET` | `{apiBaseUrl}{recurso}?{getParams}` | Listar colección |
| `GET` | `{apiBaseUrl}{recurso}/{id}?{getParams}` | Obtener un registro |
| `POST` | `{apiBaseUrl}{recurso}?{getParams}` | Crear nuevo registro |
| `PUT` | `{apiBaseUrl}{recurso}/{id}?{getParams}` | Actualizar registro existente |
| `DELETE` | `{apiBaseUrl}{recurso}/{id}` | Eliminar registro |

> **Nota:** `post(model, id)` con `id` presente hace un `PUT` en lugar de `POST` (upsert).  
> `postFormData()` envía `FormData` en lugar de JSON, misma estructura de URL.

---

## Recursos con operaciones específicas

### 6. ConnectivityService (`services/connectivity.service.ts`)

| Endpoint | Método | Descripción | Query Params |
|---|---|---|---|
| `{apiBaseUrl}ping` | `GET` | Health-check de conectividad (respuesta text/plain) | — |
| `{apiBaseUrl}user/{userId}` | `GET` | Validar token — obtiene usuario con relaciones | `expand=profile,profile.fotoclub,role` |

### 7. MetricService (`services/metric.service.ts`) — Mixto

Recurso `metric`. Usa **apiBaseUrl** para `get()`, `getAll()` y `put()`, pero **nodeApiBaseUrl** para `post()` y `delete()`.

| Endpoint | Método | API Target | Descripción |
|---|---|---|---|
| `{apiBaseUrl}metric` | `GET` | apiBaseUrl | Listar métricas |
| `{apiBaseUrl}metric/{id}` | `GET` | apiBaseUrl | Obtener métrica por ID |
| `{apiBaseUrl}metric/{id}` | `PUT` | apiBaseUrl | Actualizar métrica |
| `{nodeApiBaseUrl}metric` | `POST` | nodeApiBaseUrl | Crear métrica |
| `{nodeApiBaseUrl}metric/{id}` | `DELETE` | nodeApiBaseUrl | Eliminar métrica |

---

## Comportamiento heredado de ApiService

`ApiService` (clase abstracta en `services/api.service.ts`) determina el destino según el recurso:

```typescript
// Recursos que rutear a nodeApiBaseUrl en get/getAll:
contest-category, contest-section, contest-result

// Todo lo demás → apiBaseUrl (apiUrl)
```

Los métodos base expuestos son:

| Método base | HTTP | URL construida |
|---|---|---|
| `get(id, getParams?)` | `GET` | `{apiBaseUrl}{recurso}/{id}?{getParams}` |
| `getAll(getParams?, resource?)` | `GET` | `{apiBaseUrl}{recurso}?{getParams}` |
| `post(model, id?, getParams?)` | `POST` / `PUT` | `{apiBaseUrl}{recurso}?{getParams}` (POST) / `{apiBaseUrl}{recurso}/{id}?{getParams}` (PUT) |
| `postFormData(model, id?, getParams?)` | `POST` / `PUT` | Ídem anterior con FormData |
| `put(model, id, recurso?)` | `PUT` | `{apiBaseUrl}{recurso}/{id}` |
| `delete(id)` | `DELETE` | `{apiBaseUrl}{recurso}/{id}` |

---

## Resumen de servicios que NO usan apiBaseUrl

Para referencia, estos servicios redirigen a `nodeApiBaseUrl` o `publicApi`:

| Servicio | Recurso | API destino |
|---|---|---|
| `UserService` | `user` | nodeApiBaseUrl |
| `ProfileService` | `profile` | nodeApiBaseUrl |
| `ProfileContestService` | `profile-contest` | nodeApiBaseUrl |
| `RoleService` | `role` | nodeApiBaseUrl |
| `SectionService` | `section` | nodeApiBaseUrl |
| `CategoryService` | `category` | nodeApiBaseUrl |
| `ContestService` | `contest` | nodeApiBaseUrl + publicApi |
| `ContestResultService` | `contest-result` | nodeApiBaseUrl |
| `ContestCategoryService` | `contest-category` | nodeApiBaseUrl |
| `ContestSectionService` | `contest-section` | nodeApiBaseUrl |
| `MetricAbmService` | `metric-abm` | nodeApiBaseUrl |
| `ImageService` | `images` | nodeApiBaseUrl |
| `ContestRecordService` | `contest-record` | nodeApiBaseUrl |
| `CompressedPhotosService` | `compressed-photos` | nodeApiBaseUrl |
| `CreateUserService` | `auth/register` | nodeApiBaseUrl |
| `FooterService` | `footer` | publicApi |
| `FotoclubService` | `fotoclub` | publicApi |
| `RankingService` | `ranking` | nodeApiBaseUrl + publicApi |

---

*Documentación generada el 2026-07-05*
