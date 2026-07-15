# Endpoints PHP API — Proyecto Angular

**API Base URL:** `https://gfc.prod-api.greenborn.com.ar/`

---

## 1. ConnectivityService

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/ping` | Verificar conectividad con la API PHP |
| `GET` | `/user/{id}?expand=profile,profile.fotoclub,role` | Validar token JWT obteniendo datos del usuario autenticado |

---

## 2. InfoCentroService

Recurso: `info-centro`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/info-centro` | Listar páginas de información del centro |
| `GET` | `/info-centro/{id}` | Obtener una página de información |
| `POST` | `/info-centro` | Crear una nueva página de información |
| `PUT` | `/info-centro/{id}` | Actualizar una página de información |
| `DELETE` | `/info-centro/{id}` | Eliminar una página de información |

---

## 3. PublicInfoCentroService

Recurso: `public-info-centro`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/public-info-centro` | Listar contenido público del centro (sin autenticación) |
| `GET` | `/public-info-centro/{id}` | Obtener contenido público del centro |
| `POST` | `/public-info-centro` | Crear contenido público |
| `PUT` | `/public-info-centro/{id}` | Actualizar contenido público |
| `DELETE` | `/public-info-centro/{id}` | Eliminar contenido público |

---

## 4. PublicContestService

Recurso: `public-contest`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/public-contest` | Listar concursos públicos (sin autenticación) |
| `GET` | `/public-contest/{id}` | Obtener detalle de un concurso público |
| `POST` | `/public-contest` | Crear concurso público |
| `PUT` | `/public-contest/{id}` | Actualizar concurso público |
| `DELETE` | `/public-contest/{id}` | Eliminar concurso público |

---

## 5. PublicProfileService

Recurso: `public-profile`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/public-profile` | Listar perfiles públicos de fotógrafos |
| `GET` | `/public-profile/{id}` | Obtener perfil público de un fotógrafo |
| `POST` | `/public-profile` | Crear perfil público |
| `PUT` | `/public-profile/{id}` | Actualizar perfil público |
| `DELETE` | `/public-profile/{id}` | Eliminar perfil público |

---

## 6. StadisticsService

Recurso: `stadistics`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/stadistics` | Obtener estadísticas generales (concursos, fotógrafos, menciones, primeros puestos) |
| `GET` | `/stadistics/{id}` | Obtener estadísticas de un elemento específico |
| `POST` | `/stadistics` | Crear registro de estadísticas |
| `PUT` | `/stadistics/{id}` | Actualizar estadísticas |
| `DELETE` | `/stadistics/{id}` | Eliminar estadísticas |

---

## 7. CategoryService (PHP parcial)

Recurso: `category`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/category` | Crear una categoría |
| `PUT` | `/category/{id}` | Actualizar una categoría |
| `DELETE` | `/category/{id}` | Eliminar una categoría |

> Lecturas (`GET`) redirigidas a Node.js.

---

## 8. ImageService (PHP parcial)

Recurso: `images`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/images` | Listar imágenes/fotografías |
| `GET` | `/images/{id}` | Obtener metadata de una imagen |
| `PUT` | `/images/{id}` | Actualizar metadata de una imagen |

> Creación y eliminación redirigidas a Node.js.

---

## 9. MetricService (PHP parcial)

Recurso: `metric`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/metric` | Listar métricas (premios/puntuaciones) |
| `GET` | `/metric/{id}` | Obtener una métrica |
| `PUT` | `/metric/{id}` | Actualizar una métrica |

> Creación y eliminación redirigidas a Node.js.

---

## 10. CompressedPhotosService (PHP base — no usado)

Recurso: `compressed-photos`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/compressed-photos` | Listar fotos comprimidas |
| `GET` | `/compressed-photos/{id}` | Obtener foto comprimida |
| `POST` | `/compressed-photos` | Crear registro |
| `PUT` | `/compressed-photos/{id}` | Actualizar registro |
| `DELETE` | `/compressed-photos/{id}` | Eliminar registro |

> ⚠️ La funcionalidad real (`getCompressedPhotos`) usa Node.js. Estos endpoints PHP heredados probablemente no se utilizan.

---

## 11. FooterService (PHP base — no usado)

Recurso: `footer`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `DELETE` | `/footer/{id}` | Eliminar enlace del footer |
| `PUT` | `/footer/{id}` | Actualizar enlace del footer |

> ⚠️ Lectura y creación redirigidas a Node.js.

---

## 12. FotoclubService (PHP base — no usado)

Recurso: `fotoclub`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `DELETE` | `/fotoclub/{id}` | Eliminar un fotoclub |
| `PUT` | `/fotoclub/{id}` | Actualizar un fotoclub |

> ⚠️ Toda la operativa real redirigida a Node.js.

---

## 13. ContestService (PHP base — no usado)

Recurso: `contest`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `POST` | `/contest` | Crear concurso (vía base, no usado) |
| `PUT` | `/contest/{id}` | Actualizar concurso (vía base) |
| `DELETE` | `/contest/{id}` | Eliminar concurso (vía base) |

> ⚠️ Toda la operativa real redirigida a Node.js.

---

## 14. ContestCategoryService (PHP base)

Recurso: `contest-category`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `DELETE` | `/contest-category/{id}` | Eliminar asociación concurso-categoría |
| `PUT` | `/contest-category/{id}` | Actualizar asociación concurso-categoría |

> Lecturas, creación y actualización (vía POST con id) redirigidas a Node.js.

---

## 15. ContestSectionService (PHP base)

Recurso: `contest-section`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `DELETE` | `/contest-section/{id}` | Eliminar asociación concurso-sección |
| `PUT` | `/contest-section/{id}` | Actualizar asociación concurso-sección |

> Lecturas, creación y actualización (vía POST con id) redirigidas a Node.js.

---

## 16. ContestResultService (PHP base)

Recurso: `contest-result`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `PUT` | `/contest-result/{id}` | Actualizar resultado de jurado |

> Lecturas, creación y eliminación redirigidas a Node.js.

---

## 17. ProfileContestService (PHP base)

Recurso: `profile-contest`

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `PUT` | `/profile-contest/{id}` | Actualizar inscripción de perfil a concurso |

> Toda la demás operativa redirigida a Node.js.

---

## 18. RankingService

Recurso: `ranking`

> ⚠️ Todos los métodos usados en producción están redirigidos a Node.js:
> - `GET /ranking` (listado)
> - `POST /results/recalcular-ranking` (recálculo)
> - `GET /ranking/detalle?profile_id=...` (detalle por fotógrafo)
>
> No se utiliza la API PHP para ranking.
