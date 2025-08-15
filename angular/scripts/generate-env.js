const fs = require('fs');
const path = require('path');

// Función para leer archivo .env
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const configEnvPath = path.join(__dirname, '..', 'config.env');
  
  let filePath = null;
  
  if (fs.existsSync(envPath)) {
    filePath = envPath;
    console.log('📁 Usando archivo .env');
  } else if (fs.existsSync(configEnvPath)) {
    filePath = configEnvPath;
    console.log('📁 Usando archivo config.env');
  } else {
    console.log('⚠️  No se encontró archivo .env ni config.env, usando valores por defecto');
    return {
      API_BASE_URL: 'https://gfc.api.greenborn.com.ar/',
      PUBLIC_API_URL: 'https://gfc.api2-dev.greenborn.com.ar',
      LOGIN_ACTION: 'login',
      APP_NAME: 'app_gfc_prod-',
      APP_VERSION: '1.5.0'
    };
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, value] = trimmedLine.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });

  return envVars;
}

// Función para generar contenido del archivo environment
function generateEnvironmentContent(envVars, isProduction = false) {
  return `// Archivo generado automáticamente desde .env o config.env
// NO EDITAR MANUALMENTE - Los cambios se perderán al regenerar

export const environment = {
  production: ${isProduction},
  version: '${envVars.APP_VERSION || '1.5.0'}',
  // Configuración de la API
<<<<<<< HEAD
  apiBaseUrl: '${envVars.API_BASE_URL || 'https://gfc.prod-api.greenborn.com.ar/'}',
  publicApi: '${envVars.PUBLIC_API_URL || 'https://gfc.api2-dev.greenborn.com.ar/'}',
=======
  apiBaseUrl: '${envVars.API_BASE_URL || 'https://gfc.api.greenborn.com.ar/'}',
  publicApi: '${envVars.PUBLIC_API_URL || 'https://gfc.api2-dev.greenborn.com.ar'}',
>>>>>>> master
  loginAction: '${envVars.LOGIN_ACTION || 'login'}',
  appName: '${envVars.APP_NAME || 'app_gfc_prod-'}',
  imagesBaseUrl: '${envVars.IMAGES_BASE_URL || 'assets.prod-gfc.greenborn.com.ar'}',
  nodeApiBaseUrl: ${envVars.NODE_API_BASE_URL ? `'${envVars.NODE_API_BASE_URL.replace(/['"]+/g, '')}'` : "''"}
};
`;
}

// Función principal
function generateEnvironmentFiles() {
  console.log('🔄 Generando archivos de entorno...');
  
  const envVars = readEnvFile();
  const environmentsDir = path.join(__dirname, '..', 'src', 'environments');
  
  // Asegurar que el directorio existe
  if (!fs.existsSync(environmentsDir)) {
    fs.mkdirSync(environmentsDir, { recursive: true });
  }

  // Generar environment.ts (desarrollo)
  const devPath = path.join(environmentsDir, 'environment.ts');
  fs.writeFileSync(devPath, generateEnvironmentContent(envVars, false));
  console.log('✅ environment.ts generado');

  // Generar environment.prod.ts (producción)
  const prodPath = path.join(environmentsDir, 'environment.prod.ts');
  fs.writeFileSync(prodPath, generateEnvironmentContent(envVars, true));
  console.log('✅ environment.prod.ts generado');

  console.log('🎉 Archivos de entorno generados exitosamente');
  console.log('📝 Variables utilizadas:');
  console.log(`   API_BASE_URL: ${envVars.API_BASE_URL}`);
  console.log(`   PUBLIC_API_URL: ${envVars.PUBLIC_API_URL}`);
  console.log(`   LOGIN_ACTION: ${envVars.LOGIN_ACTION}`);
  console.log(`   APP_NAME: ${envVars.APP_NAME}`);
  console.log(`   APP_VERSION: ${envVars.APP_VERSION}`);
  console.log(`   NODE_API_BASE_URL: ${envVars.NODE_API_BASE_URL}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateEnvironmentFiles();
}

module.exports = { generateEnvironmentFiles, readEnvFile }; 