Tenemos la siguiente definicion del endpoint para consultar detalle de ranking

**GET** `/ranking/detalle`

Obtiene el detalle de participación y ranking de un concursante dentro de un concurso específico. Incluye datos del concurso y del perfil, categorías asignadas por inscripción, secciones en las que tiene resultados, listado de imágenes con sus métricas y el ranking total con posición calculada contra el resto de participantes del concurso.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Query Parameters
- `profile_id` (int, requerido): ID del concursante (perfil)
- `contest_id` (int, opcional): ID del concurso
- `year` (int, opcional): Año a consultar si no se especifica `contest_id` (default: año actual)

#### Respuesta Exitosa (200)
```json
{
  "contest": {
    "id": 51,
    "name": "Tres elementos y Paisaje",
    "description": "...",
    "start_date": "2025-07-27 22:53:00",
    "end_date": "2025-08-17 23:58:00",
    "organization_type": "INTERNO",
    "judged": true
  },
  "profile": {
    "id": 123,
    "name": "Juan",
    "last_name": "Pérez",
    "fotoclub": { "id": 7, "name": "GFC", "photo_url": "..." },
    "img_url": "images/perfil/123.jpg"
  },
  "categories": [
    { "id": 2, "name": "Primera" }
  ],
  "sections": [
    { "id": 1, "name": "Color" },
    { "id": 2, "name": "Monocromo" }
  ],
  "results": [
    {
      "section": "Color",
      "category": "Primera",
      "images": [
        { "image_id": 10047, "metric": { "prize": "1er PREMIO", "score": 95 } },
        { "image_id": 10048, "metric": { "prize": "ACEPTADA", "score": 1 } }
      ]
    },
    {
      "section": "Monocromo",
      "category": "Primera",
      "images": [
        { "image_id": 10090, "metric": { "prize": "MENCION", "score": 5 } }
      ]
    }
  ],
  "ranking": {
    "total_score": 101,
    "position": 2
  }
}
```

#### Respuesta de Error (401)
```json
{ "success": false, "message": "No autenticado" }
```

#### Respuesta de Error (403)
```json
{ "success": false, "message": "El concursante no está inscripto en el concurso" }
```

#### Respuesta de Error (404)
```json
{ "success": false, "message": "Concurso no encontrado" }
```
```json
{ "success": false, "message": "Concursante no encontrado" }
```

#### Respuesta de Error (500)
```json
{ "success": false, "message": "Error interno", "error": "Detalles" }
```

#### Características del Endpoint
- **Autenticación**: Requerida (Bearer Token)
- **Permisos**: Usuarios autenticados
- **Validación**: Verifica inscripción del perfil en el concurso (`profile_contest`)
- **Datos incluidos**: `contest`, `profile` (con `fotoclub`), `categories`, `sections`, `results` y `ranking`
- **Cálculo de ranking**: Suma `metric.score` del concursante y calcula `position` comparando contra total de participantes del concurso


necesito que se modifique vista de detalle de ranking para lo cual en la tabla de resultados generales
se agrega nueva columna (a la derecha de columna de premios y sin encabezado) en la cual se agrega nuevo boton de detalles

al presionar el boton de detalles se realiza petición a endpoint de detalle de ranking

al momento de hacer la peticion se presenta el loading, cuando se obtiene respuesta se oculta el loading

al obtener resultado de la peticion se presenta modal con tabla cpn vista de detalles