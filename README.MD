# Grupo Fotográfico Centro - Frontend

Aplicación web frontend para la gestión de concursos fotográficos del Grupo Fotográfico Centro. Desarrollada con Angular 12 e Ionic 6.

## 📋 Descripción

Esta aplicación permite la gestión completa de concursos fotográficos, incluyendo:
- Gestión de concursos y participantes
- Sistema de inscripciones y juzgamiento
- Administración de usuarios y organizaciones
- Galería de fotografías
- Sistema de notificaciones
- Panel de administración

## 🚀 Tecnologías

- **Framework**: Angular 12.1.1
- **UI Framework**: Ionic 6.5.1
- **Lenguaje**: TypeScript 4.2.4
- **Gestión de Estado**: RxJS
- **HTTP Client**: Axios 1.7.7
- **Build Tool**: Angular CLI 12.1.1
- **Testing**: Jasmine & Karma
- **Mobile**: Capacitor 3.2.2

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn
- Angular CLI: `npm install -g @angular/cli`

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd GFC-Front
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de configuración
cp src/environments/environment.ts.example src/environments/environment.ts
# Editar las variables según tu entorno
```

4. **Ejecutar en modo desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 🏗️ Scripts disponibles

```bash
# Desarrollo
npm start                    # Inicia el servidor de desarrollo
npm run build               # Construye para producción
npm test                    # Ejecuta las pruebas unitarias
npm run lint                # Ejecuta el linter
npm run e2e                 # Ejecuta las pruebas end-to-end
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── concursos/          # Módulo de concursos
│   ├── usuario/            # Módulo de usuarios
│   ├── modules/auth/       # Módulo de autenticación
│   ├── shared/             # Componentes compartidos
│   ├── services/           # Servicios de la aplicación
│   ├── models/             # Modelos de datos
│   └── nav/                # Componentes de navegación
├── assets/                 # Recursos estáticos
├── environments/           # Configuraciones de entorno
└── theme/                  # Estilos globales
```

## 📚 Documentación

La documentación completa del proyecto se encuentra en el directorio `documentacion/`:

- [Arquitectura](./documentacion/arquitectura.md) - Descripción de la arquitectura del sistema
- [Componentes](./documentacion/componentes.md) - Documentación de todos los componentes
- [Rutas](./documentacion/rutas.md) - Mapeo completo de rutas y navegación
- [Servicios](./documentacion/servicios.md) - Documentación de servicios y APIs
- [Modelos](./documentacion/modelos.md) - Definición de modelos de datos

## 🔧 Configuración

### Variables de Entorno

Crear archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Otras configuraciones...
};
```

### Configuración de Capacitor (Mobile)

```bash
# Agregar plataforma iOS
npx cap add ios

# Agregar plataforma Android
npx cap add android

# Sincronizar cambios
npx cap sync
```

## 🧪 Testing

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar pruebas e2e
npm run e2e
```

## 📱 Build para Producción

```bash
# Construir para web
npm run build

# Construir para mobile
npx cap build ios
npx cap build android
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Greenborn** - *Desarrollo inicial* - [Greenborn](https://greenborn.com.ar)

## 📞 Soporte

Para soporte técnico o consultas, contactar a través de:
- Email: [email]
- Sitio web: [https://greenborn.com.ar](https://greenborn.com.ar)

---

## 📝 Change Log

### **1.1.32** (En desarrollo)
- Mejoras en la interfaz de usuario
- Optimizaciones de rendimiento
- Correcciones de bugs menores

### **1.1.31**
- Edición de campo fotoclub / organización nuevamente funcional
- Se corrige ancho de selectores de filtros en vista de fotografías

### **1.1.29**
- Solución a error que impedía la actualización del perfil personal
- Mejoras en mensajes de error
- Correcciones en formularios de edición

### **1.1.26**
- Se corrige bug por el cual se mostraba botón de inscripción en concursos cerrados
- Se corrige bug que excluía algunos resultados de los filtros

### **1.1.24**
- Se modifica visibilidad de botón de galería de imágenes en listado de concursantes

### **1.1.23**
- Modificación en visibilidad de nombre de concursante

### **1.1.22**
- Bug resuelto: Cuando un concurso está abierto no se muestra nombre de autor

### **1.1.21**
- En vista de detalle de imagen, se mueve de posición botón de cerrar modal

### **1.1.20**
- Se quita margen excesivo en móviles
- Se cambia título de modal de detalle de imagen a uno genérico

### **1.1.19**
- Mejora en visualización de galería: se limita ancho máximo de textos
- Mejora en vista de detalle de imagen, se cambia los controles de navegación

### **1.1.18**
- Se arregla visualización de detalle de imagen en desktop
- Se arregla definición de horario al definir o modificar un concurso

### **1.1.17**
- Se soluciona bug que cerraba sesión en vista móvil al querer editar perfil
- Se mejora presentación de galería

### **1.1.16**
- Mejora en vista de detalles de fotografía

### **1.1.15**
- Vista de fotografías en formato galería

### **1.0.15**
- Orden alfabético en selector de organizaciones
- Modificación de etiqueta de selector de organización
- Corrección en textos de botones de selectores
- Corrección a error en botonera de acciones sobre fotografías

### **1.0.13**
- Corrección lang
- Se aumenta límite de tamaño de fotografías

### **1.0.12**
- Se formate fechas de concurso para asegurarse de que siempre se vea en el formato correcto

### **1.0.2**
- Se agrega botón para descarga de archivo comprimido de fotografías