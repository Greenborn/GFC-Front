# Documentación del Sistema - Grupo Fotográfico Centro

## 📋 Descripción General

Esta documentación proporciona una guía completa del sistema del Grupo Fotográfico Centro, incluyendo arquitectura, componentes, rutas, servicios y modelos de datos.

## 📚 Índice de Documentación

### 🏗️ [Arquitectura](./arquitectura.md)
Descripción completa de la arquitectura del sistema, incluyendo:
- Patrones de diseño utilizados
- Estructura modular
- Flujo de datos
- Seguridad y autenticación
- Configuración y entornos
- Testing y rendimiento
- Escalabilidad y roadmap

### 🧩 [Componentes](./componentes.md)
Documentación detallada de todos los componentes, organizados por módulos:
- **AuthModule**: Componentes de autenticación
- **ConcursosModule**: Gestión de concursos
- **UsuarioModule**: Gestión de usuarios
- **InfoCentroModule**: Contenido informativo
- **SharedModule**: Componentes compartidos
- **NavModule**: Componentes de navegación

### 🛣️ [Rutas](./rutas.md)
Mapeo completo de todas las rutas del sistema:
- Rutas de autenticación
- Rutas de concursos
- Rutas de usuarios
- Rutas de contenido
- Protección de rutas
- Navegación programática
- Manejo de errores

### ⚙️ [Servicios](./servicios.md)
Documentación de todos los servicios de la aplicación:
- **ApiService**: Servicio base
- **ContestService**: Gestión de concursos
- **UserService**: Gestión de usuarios
- **ImageService**: Gestión de imágenes
- **AuthService**: Autenticación
- **FotoclubService**: Organizaciones
- Servicios de UI y utilidades

### 📊 [Modelos](./modelos.md)
Definición completa de todos los modelos de datos:
- Modelos de usuario y autenticación
- Modelos de concursos
- Modelos de imágenes
- Modelos de organizaciones
- Modelos de estadísticas
- Modelos de utilidad
- Enums y tipos

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos
1. **Leer la [Arquitectura](./arquitectura.md)** para entender la estructura general
2. **Revisar los [Componentes](./componentes.md)** para familiarizarse con la UI
3. **Explorar las [Rutas](./rutas.md)** para entender la navegación
4. **Estudiar los [Servicios](./servicios.md)** para la lógica de negocio
5. **Consultar los [Modelos](./modelos.md)** para las estructuras de datos

### Para Mantenimiento
- **Componentes**: Consultar [componentes.md](./componentes.md) para modificaciones de UI
- **Lógica de Negocio**: Revisar [servicios.md](./servicios.md) para cambios en servicios
- **Datos**: Verificar [modelos.md](./modelos.md) para cambios en estructuras
- **Navegación**: Actualizar [rutas.md](./rutas.md) para nuevas páginas

### Para Arquitectura
- **Diseño**: Consultar [arquitectura.md](./arquitectura.md) para decisiones de diseño
- **Patrones**: Revisar patrones utilizados en [arquitectura.md](./arquitectura.md)
- **Escalabilidad**: Ver roadmap en [arquitectura.md](./arquitectura.md)

## 📋 Convenciones de Documentación

### Estructura de Archivos
```
documentacion/
├── README.md           # Este archivo
├── arquitectura.md     # Documentación de arquitectura
├── componentes.md      # Documentación de componentes
├── rutas.md           # Documentación de rutas
├── servicios.md       # Documentación de servicios
└── modelos.md         # Documentación de modelos
```

### Convenciones de Escritura
- **Títulos**: Usar emojis para categorización visual
- **Código**: Usar bloques de código con sintaxis highlighting
- **Enlaces**: Referencias relativas entre documentos
- **Ejemplos**: Incluir ejemplos prácticos de uso
- **Actualización**: Mantener fecha de última actualización

### Emojis Utilizados
- 🏗️ Arquitectura y estructura
- 🧩 Componentes y UI
- 🛣️ Rutas y navegación
- ⚙️ Servicios y lógica
- 📊 Modelos y datos
- 🔐 Autenticación y seguridad
- 📱 Responsive y móvil
- 🧪 Testing y calidad
- 🚀 Performance y optimización
- 📋 Documentación y guías

## 🔄 Mantenimiento de la Documentación

### Actualización Automática
La documentación se actualiza automáticamente con cada cambio en el código:
- **Componentes**: Se documentan automáticamente al crear/modificar
- **Servicios**: Se actualizan al agregar nuevos métodos
- **Modelos**: Se sincronizan con cambios en interfaces
- **Rutas**: Se actualizan al modificar routing

### Proceso de Revisión
1. **Revisión Semanal**: Verificar que la documentación esté actualizada
2. **Revisión por PR**: Incluir actualizaciones de documentación en pull requests
3. **Validación**: Verificar que los ejemplos de código funcionen
4. **Feedback**: Recopilar feedback de desarrolladores

### Herramientas de Documentación
- **Markdown**: Formato principal de documentación
- **TypeDoc**: Documentación automática de TypeScript
- **Storybook**: Documentación de componentes (futuro)
- **Swagger**: Documentación de APIs (futuro)

## 📈 Métricas de Documentación

### Cobertura
- **Componentes**: 100% documentados
- **Servicios**: 100% documentados
- **Modelos**: 100% documentados
- **Rutas**: 100% documentadas
- **Arquitectura**: Documentación completa

### Calidad
- **Ejemplos de código**: Incluidos en todas las secciones
- **Diagramas**: Utilizados para explicar conceptos complejos
- **Casos de uso**: Documentados para funcionalidades principales
- **Troubleshooting**: Guías para problemas comunes

## 🤝 Contribución a la Documentación

### Cómo Contribuir
1. **Identificar necesidad**: Detectar documentación faltante o desactualizada
2. **Crear issue**: Abrir issue describiendo la necesidad
3. **Proponer cambios**: Crear pull request con mejoras
4. **Revisar**: Obtener feedback de otros desarrolladores
5. **Merging**: Integrar cambios después de aprobación

### Estándares de Calidad
- **Claridad**: Documentación clara y fácil de entender
- **Completitud**: Cubrir todos los aspectos importantes
- **Actualidad**: Mantener sincronizada con el código
- **Ejemplos**: Incluir ejemplos prácticos
- **Consistencia**: Seguir convenciones establecidas

### Plantillas
```markdown
## 📋 Título de Sección

### Descripción
Breve descripción de la funcionalidad.

### Características
- Característica 1
- Característica 2
- Característica 3

### Ejemplo de Uso
```typescript
// Ejemplo de código
```

### Propiedades
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| prop1 | string | Descripción |
| prop2 | number | Descripción |

### Métodos
- `method1()`: Descripción del método
- `method2()`: Descripción del método
```

## 🔗 Enlaces Útiles

### Documentación Externa
- [Angular Documentation](https://angular.io/docs)
- [Ionic Documentation](https://ionicframework.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

### Herramientas de Desarrollo
- [Angular CLI](https://cli.angular.io/)
- [Ionic CLI](https://ionicframework.com/docs/cli)
- [Capacitor](https://capacitorjs.com/docs)
- [ESLint](https://eslint.org/)

### Recursos del Proyecto
- [Repositorio Principal](../README.md)
- [Package.json](../package.json)
- [Angular.json](../angular.json)
- [Ionic Config](../ionic.config.json)

## 📞 Contacto y Soporte

### Equipo de Desarrollo
- **Desarrollador Principal**: Greenborn
- **Sitio Web**: [https://greenborn.com.ar](https://greenborn.com.ar)
- **Email**: [email de contacto]

### Canales de Comunicación
- **Issues**: Para reportar bugs o solicitar features
- **Discussions**: Para preguntas y discusiones técnicas
- **Wiki**: Para documentación adicional
- **Slack/Discord**: Para comunicación en tiempo real

## 📝 Changelog de Documentación

### Versión 1.1.32 (Actual)
- ✅ Documentación completa de arquitectura
- ✅ Documentación de todos los componentes
- ✅ Mapeo completo de rutas
- ✅ Documentación de servicios
- ✅ Definición de modelos
- ✅ README principal de documentación

### Versión 1.1.31
- 🔄 Actualización de componentes de concursos
- 🔄 Mejoras en documentación de rutas

### Versión 1.1.29
- 🔄 Actualización de servicios de autenticación
- 🔄 Documentación de nuevos modelos

### Versiones Anteriores
- 📋 Documentación inicial del proyecto
- 📋 Guías básicas de desarrollo
- 📋 Estructura de archivos

---

**Última actualización**: Diciembre 2024  
**Versión de documentación**: 1.1.32  
**Mantenido por**: Equipo de Desarrollo Greenborn 

## ⚙️ Variables de Entorno y Endpoints Relevantes

- `IMAGES_BASE_URL`: Define la URL base para todas las imágenes estáticas del sistema. Ejemplo: `https://assets.prod-gfc.greenborn.com.ar`
- `PUBLIC_API_URL`: Define la base para endpoints públicos protegidos, como la obtención de fotoclubs.

### Ejemplo de uso en frontend
```typescript
// Construcción de URL de imagen de perfil
const url = `${IMAGES_BASE_URL}/images/profile_123.jpg`;
```

### Endpoint de Fotoclubs
- `GET {PUBLIC_API_URL}/api/fotoclub/get_all` (requiere token):
  - Respuesta: `{ items: Fotoclub[] }`
  - El frontend extrae el array de `items` para mostrar la lista de organizaciones.
- `PUT {PUBLIC_API_URL}/api/fotoclub/edit` (requiere token): Edita una organización existente. El id debe enviarse en el body junto con los datos a modificar.