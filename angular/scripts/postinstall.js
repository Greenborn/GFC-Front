const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const projectBasePath = path.resolve(__dirname, '..');

function nodeMajorVersion() {
  return parseInt(process.version.slice(1), 10);
}

function findLockFile(basePath) {
  for (const name of ['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json']) {
    try {
      const p = path.join(basePath, name);
      return { data: fs.readFileSync(p), path: p };
    } catch {}
  }
  return null;
}

function createNgccLockFile() {
  const lock = findLockFile(projectBasePath);
  if (!lock) return false;

  let tsconfigPath;
  for (const name of ['tsconfig.app.json', 'tsconfig.json']) {
    const p = path.join(projectBasePath, name);
    if (fs.existsSync(p)) { tsconfigPath = p; break; }
  }
  if (!tsconfigPath) return false;

  const tsconfigData = fs.readFileSync(tsconfigPath);
  const relativeTsconfigPath = path.relative(projectBasePath, tsconfigPath);

  let ngccConfigData = '';
  try {
    ngccConfigData = fs.readFileSync(path.join(projectBasePath, 'ngcc.config.js'));
  } catch {}

  const runHash = crypto.createHash('sha256')
    .update(lock.data)
    .update(lock.path)
    .update(ngccConfigData)
    .update(tsconfigData)
    .update(relativeTsconfigPath)
    .digest('hex');

  const nodeModulesDir = path.join(projectBasePath, 'node_modules');
  const runHashBasePath = path.join(nodeModulesDir, '.cli-ngcc');
  if (!fs.existsSync(runHashBasePath)) {
    fs.mkdirSync(runHashBasePath, { recursive: true });
  }
  const lockPath = path.join(runHashBasePath, runHash + '.lock');
  if (!fs.existsSync(lockPath)) {
    fs.writeFileSync(lockPath, '');
  }
  return true;
}

if (nodeMajorVersion() >= 22) {
  console.log('Node >=22 detectado. La compilación AOT ahora maneja ngcc automáticamente.');
  createNgccLockFile();
}
