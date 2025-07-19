# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para ambos proyectos (Angular y Vue).

## Proyecto Angular

### Configuración Actual

El proyecto Angular usa archivos de entorno en `src/environments/`:

- `environment.ts` - Desarrollo
- `environment.prod.ts` - Producción
- `environment.local.ts` - Local (para cambios rápidos)

### Variables Configurables

```typescript
export const environment = {
  production: false,
  version: '1.5.0',
  // Configuración de la API
  apiBaseUrl: 'https://gfc.prod-api.greenborn.com.ar/',
  publicApi: 'https://gfc.api2.greenborn.com.ar/',
  loginAction: 'login',
  appName: 'app_gfc_prod-'
};
```

### Cómo Cambiar la Configuración

1. **Para desarrollo local**: Edita `src/environments/environment.local.ts`
2. **Para producción**: Edita `src/environments/environment.prod.ts`
3. **Para desarrollo general**: Edita `src/environments/environment.ts`

### Ejemplo para Desarrollo Local

```typescript
// src/environments/environment.local.ts
export const environment = {
  production: false,
  version: '1.5.0',
  apiBaseUrl: 'http://localhost:8888/',
  publicApi: 'http://localhost:8888/',
  loginAction: 'login',
  appName: 'app_gfc_dev-'
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

## Ventajas de Usar Variables de Entorno

1. **Seguridad**: Las URLs sensibles no están hardcodeadas
2. **Flexibilidad**: Fácil cambio entre entornos (dev, staging, prod)
3. **Mantenimiento**: Centralización de la configuración
4. **Colaboración**: Cada desarrollador puede tener su propia configuración

## Recomendaciones

1. **Nunca commits archivos `.env`** con información sensible
2. **Usa `.env.example`** para documentar las variables necesarias
3. **Valores por defecto**: Siempre proporciona valores por defecto en el código
4. **Validación**: Considera validar las variables de entorno al inicio de la aplicación

## Comandos Útiles

### Angular
```bash
# Desarrollo
ng serve

# Producción
ng build --prod

# Con configuración específica
ng serve --configuration=local
```

### Vue
```bash
# Desarrollo
npm run dev

# Producción
npm run build

# Con variables de entorno específicas
VITE_API_BASE_URL=http://localhost:8888/ npm run dev
``` 