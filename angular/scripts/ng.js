const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function readDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: No .env file found at', envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) return;
    let key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  });
  return vars;
}

function generateEnvContent(vars, production) {
  return `export const environment = {
  production: ${production},
  version: ${JSON.stringify(vars.APP_VERSION || (JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version) || '1.0.0')},
  apiBaseUrl: ${JSON.stringify(vars.API_BASE_URL || '')},
  publicApi: ${JSON.stringify(vars.PUBLIC_API_URL || '')},
  loginAction: ${JSON.stringify(vars.LOGIN_ACTION || '')},
  appName: ${JSON.stringify(vars.APP_NAME || '')},
  imagesBaseUrl: ${JSON.stringify(vars.IMAGES_BASE_URL || '')},
  nodeApiBaseUrl: ${JSON.stringify(vars.NODE_API_BASE_URL || '')},
  ssoBaseUrl: ${JSON.stringify(vars.SSO_BASE_URL || '')},
  ssoRedirect: ${JSON.stringify(vars.SSO_REDIRECT || '')}
};
`;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/ng.js <serve|build> [options...]');
  process.exit(1);
}

const command = args[0];
const envVars = readDotEnv();
const isProduction = command === 'build' && args.some(a => a.includes('production'));
const root = path.join(__dirname, '..');

// Generate environment files
const devContent = generateEnvContent(envVars, false);
const prodContent = generateEnvContent(envVars, true);
fs.writeFileSync(path.join(root, 'src', 'environments', 'environment.ts'), devContent);
fs.writeFileSync(path.join(root, 'src', 'environments', 'environment.prod.ts'), prodContent);

console.log(`📝 environment files generated from .env (production: ${isProduction})`);

const ngBin = path.join(root, 'node_modules', '.bin', 'ng');
const ngArgs = args.slice(1);
const allArgs = [command, ...ngArgs];

console.log(`🚀 ng ${command} ${ngArgs.join(' ')}`);
const result = spawnSync(ngBin, allArgs, {
  stdio: 'inherit',
  cwd: root
});

process.exit(result.status ?? 1);
