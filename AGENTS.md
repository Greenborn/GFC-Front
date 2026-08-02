# AGENTS.md

## Actualizar número de versión

Para incrementar la versión del proyecto usa el script `angular/scripts/bump-version.js` (desde el directorio `angular/`):

```bash
# Desde angular/
node scripts/bump-version.js            # sube el patch (1.19.53 -> 1.19.54)
node scripts/bump-version.js minor      # sube el minor (1.19.53 -> 1.20.0)
node scripts/bump-version.js major      # sube el major (1.19.53 -> 2.0.0)
node scripts/bump-version.js 1.20.0     # fija una versión exacta
```

O vía npm:

```bash
npm run version
```

El script actualiza automáticamente:
- `angular/package.json` (campo `version`)
- `angular/README.MD` (`APP_VERSION` en "Variables de Entorno")
- `angular/.env` y `angular/config.env` (si existen, campo `APP_VERSION`)
- `angular/src/environments/environment*.ts` (campo `version`)
- Agrega una entrada vacía al `Change Log` en `README.MD`

El número de versión que se muestra en el menú sale de `APP_VERSION` en el `.env`
que se usa al compilar. Mantenlo sincronizado con el script de bump.

Tras actualizar la versión, rellena la entrada del Change Log con los cambios correspondientes.
