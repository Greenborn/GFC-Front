#!/usr/bin/env node
/**
 * Script para incrementar el número de versión del proyecto.
 *
 * Uso:
 *   node scripts/bump-version.js            # sube el patch (1.19.53 -> 1.19.54)
 *   node scripts/bump-version.js minor      # sube el minor (1.19.53 -> 1.20.0)
 *   node scripts/bump-version.js major      # sube el major (1.19.53 -> 2.0.0)
 *   node scripts/bump-version.js 1.20.0     # fija una versión exacta
 *
 * Actualiza:
 *   - angular/package.json (campo "version")
 *   - angular/README.MD (APP_VERSION en "Variables de Entorno")
 *   - Agrega una entrada vacía al Change Log en README.MD
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const readmePath = path.join(root, 'README.MD');

const current = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
const arg = process.argv[2];

let next;
if (!arg) {
  next = bump(current, 'patch');
} else if (/^major|minor|patch$/.test(arg)) {
  next = bump(current, arg);
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  next = arg;
} else {
  console.error(`Versión inválida: "${arg}". Usa major|minor|patch o un semver 0.0.0`);
  process.exit(1);
}

// 1. package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 2. README.MD - APP_VERSION
let readme = fs.readFileSync(readmePath, 'utf8');
const appVerRe = /(APP_VERSION=)\d+\.\d+\.\d+/;
if (!appVerRe.test(readme)) {
  console.error('No se encontró APP_VERSION en README.MD');
  process.exit(1);
}
readme = readme.replace(appVerRe, `$1${next}`);

// 3. Change Log - agregar entrada vacía
const dateLabel = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
const newEntry = `### **${next}** (${capitalize(dateLabel)})\n\n`;
const changelogMarker = `## Change Log`;
if (readme.includes(`### **${next}**`)) {
  console.log(`La entrada ${next} ya existe en el Change Log.`);
} else if (readme.includes(changelogMarker)) {
  readme = readme.replace(changelogMarker, `${changelogMarker}\n\n${newEntry}`);
}

fs.writeFileSync(readmePath, readme);

// 4. .env y config.env - APP_VERSION (si existen)
const envFiles = ['.env', 'config.env'].map(f => path.join(root, f));
envFiles.forEach(envPath => {
  if (!fs.existsSync(envPath)) return;
  let env = fs.readFileSync(envPath, 'utf8');
  if (/(APP_VERSION=)\d+\.\d+\.\d+/.test(env)) {
    env = env.replace(/(APP_VERSION=)\d+\.\d+\.\d+/, `$1${next}`);
    fs.writeFileSync(envPath, env);
    console.log(` - ${path.relative(process.cwd(), envPath)}`);
  }
});

// 5. environment files (si existen) - version
const envSrcDir = path.join(root, 'src', 'environments');
if (fs.existsSync(envSrcDir)) {
  fs.readdirSync(envSrcDir).forEach(file => {
    if (!/^environment.*\.ts$/.test(file)) return;
    const envPath = path.join(envSrcDir, file);
    let env = fs.readFileSync(envPath, 'utf8');
    if (/(version:\s*["'])\d+\.\d+\.\d+(["''])/.test(env)) {
      env = env.replace(/(version:\s*["'])\d+\.\d+\.\d+(["'])/, `$1${next}$2`);
      fs.writeFileSync(envPath, env);
      console.log(` - ${path.relative(process.cwd(), envPath)}`);
    }
  });
}

console.log(`Versión actualizada: ${current} -> ${next}`);
console.log(` - ${path.relative(process.cwd(), pkgPath)}`);
console.log(` - ${path.relative(process.cwd(), readmePath)}`);

function bump(version, part) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (part === 'major') return `${major + 1}.0.0`;
  if (part === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
