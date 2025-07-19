# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para ambos proyectos (Angular y Vue).

## Proyecto Angular

### ✅ Sistema Automático de Variables de Entorno

El proyecto Angular ahora usa un **sistema automático** que lee variables desde archivos de configuración y genera los archivos `environment.ts` automáticamente.

### Archivos de Configuración

1. **`config.env`** - Archivo de configuración principal (incluido en git)
2. **`.env`** - Archivo local (ignorado por git, para configuraciones personales)

### Variables Configurables

```bash
# URLs de la API
API_BASE_URL=https://gfc.prod-api.greenborn.com.ar/
PUBLIC_API_URL=https://gfc.api2.greenborn.com.ar/

# Configuración de autenticación
LOGIN_ACTION=login

# Configuración de la aplicación
APP_NAME=app_gfc_prod-
APP_VERSION=1.5.0
```

### Cómo Funciona

1. **Automático**: Los archivos `environment.ts` se generan automáticamente antes de `npm start` y `npm run build`
2. **Flexible**: Puedes usar `config.env` (incluido en git) o `.env` (local)
3. **Seguro**: Valores por defecto si no se encuentra archivo de configuración

### Comandos Disponibles

```bash
# Generar archivos de entorno manualmente
npm run generate-env

# Iniciar desarrollo (genera entorno automáticamente)
npm start

# Build de producción (genera entorno automáticamente)
npm run build
```

### Cómo Cambiar la Configuración

#### Opción 1: Usar config.env (Recomendado para equipo)
```bash
# Edita el archivo config.env
API_BASE_URL=http://localhost:8888/
PUBLIC_API_URL=http://localhost:8888/
```

#### Opción 2: Usar .env (Para configuración personal)
```bash
# Copia config.env como .env
cp config.env .env

# Edita .env con tus configuraciones
API_BASE_URL=http://tu-servidor-local:8888/
```

### Archivos Generados

Los archivos `environment.ts` y `environment.prod.ts` se generan automáticamente con este contenido:

```typescript
// Archivo generado automáticamente desde .env o config.env
// NO EDITAR MANUALMENTE - Los cambios se perderán al regenerar

export const environment = {
  production: false, // o true para producción
  version: '1.5.0',
  apiBaseUrl: 'https://gfc.prod-api.greenborn.com.ar/',
  publicApi: 'https://gfc.api2.greenborn.com.ar/',
  loginAction: 'login',
  appName: 'app_gfc_prod-'
};
```

## Proyecto Vue

### Configuración Actual

El proyecto Vue usa variables de entorno de Vite con el prefijo `VITE_`.

### Variables Configurables

```bash
# URLs de la API
VITE_API_BASE_URL=https://gfc.prod-api.greenborn.com.ar/
VITE_PUBLIC_API_URL=https://gfc.api2.greenborn.com.ar/

# Configuración de autenticación
VITE_LOGIN_ACTION=login

# Configuración de la aplicación
VITE_APP_NAME=app_gfc_prod-
VITE_VERSION=1.1.32
```

### Cómo Configurar

1. Copia `test_vue/env.example` como `test_vue/.env`
2. Edita las variables según tu entorno

### Ejemplo para Desarrollo Local

```bash
# test_vue/.env
VITE_API_BASE_URL=http://localhost:8888/
VITE_PUBLIC_API_URL=http://localhost:8888/
VITE_LOGIN_ACTION=login
VITE_APP_NAME=app_gfc_dev-
VITE_VERSION=1.1.32
```

## Ventajas del Nuevo Sistema

### Angular
- ✅ **Automático**: No necesitas recordar regenerar archivos
- ✅ **Flexible**: Usa `config.env` para equipo o `.env` para personal
- ✅ **Seguro**: Valores por defecto si algo falla
- ✅ **Mantenible**: Un solo lugar para cambiar configuración

### Vue
- ✅ **Nativo**: Usa el sistema de Vite
- ✅ **Simple**: Variables con prefijo `VITE_`
- ✅ **Eficiente**: Solo las variables necesarias se incluyen en el build

## Recomendaciones

1. **Para desarrollo en equipo**: Usa `config.env` en Angular
2. **Para configuración personal**: Usa `.env` (no se commitea)
3. **Nunca edites manualmente** los archivos `environment.ts` generados
4. **Siempre ejecuta** `npm run generate-env` si cambias `config.env` manualmente

## Comandos Útiles

### Angular
```bash
# Generar entorno manualmente
npm run generate-env

# Desarrollo (genera entorno automáticamente)
npm start

# Producción (genera entorno automáticamente)
npm run build

# Ver variables actuales
node scripts/generate-env.js
```

### Vue
```bash
# Desarrollo
npm run dev

# Producción
npm run build

# Con variables específicas
VITE_API_BASE_URL=http://localhost:8888/ npm run dev
```

## Solución de Problemas

### Angular
- **Problema**: Los archivos `environment.ts` no se actualizan
- **Solución**: Ejecuta `npm run generate-env`

- **Problema**: Variables no se leen correctamente
- **Solución**: Verifica que `config.env` o `.env` esté en la raíz del proyecto Angular

### Vue
- **Problema**: Variables no se cargan
- **Solución**: Asegúrate de que el archivo `.env` esté en la raíz del proyecto Vue
- **Solución**: Verifica que las variables tengan el prefijo `VITE_` 