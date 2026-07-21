const fs = require('fs');
const path = require('path');

// Leer la versión del package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Función para actualizar la versión en un archivo de environment
function updateEnvironmentFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar la versión existente o agregar una nueva
  if (content.includes('version:')) {
    content = content.replace(/version:\s*['"][^'"]*['"]/, `version: '${version}'`);
  } else {
    // Si no existe la propiedad version, agregarla después de production
    content = content.replace(
      /production:\s*(true|false)/,
      `production: $1,\n  version: '${version}'`
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Versión actualizada en ${filePath}: ${version}`);
}

// Actualizar los archivos de environment
updateEnvironmentFile('src/environments/environment.ts');
updateEnvironmentFile('src/environments/environment.prod.ts');
updateEnvironmentFile('src/environments/environment.local.ts');

console.log(`🎉 Versión ${version} actualizada en todos los archivos de environment`); 