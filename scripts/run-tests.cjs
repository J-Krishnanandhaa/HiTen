// Compiles the pure modules to CommonJS, then runs the Node test runner.
// (The app itself is ESM, so the build folder gets its own package.json.)
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
fs.rmSync(path.join(root, '.test-build'), { recursive: true, force: true });
execSync('npx tsc -p tsconfig.test.json', { cwd: root, stdio: 'inherit' });
fs.writeFileSync(path.join(root, '.test-build', 'package.json'), '{ "type": "commonjs" }\n');
const files = fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.test.cjs')).map(f => path.join('tests', f));
execSync(`node --test ${files.join(' ')}`, { cwd: root, stdio: 'inherit' });
