// scripts/instalar-plataforma-base.js

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, '..');
const caminhoEnv = resolve(raiz, '.env');

let token = '';
try {
  const envContent = readFileSync(caminhoEnv, 'utf-8');
  const match = envContent.match(/^NPM_TOKEN=(.*)$/m);
  if (match) token = match[1].trim();
} catch (err) {
  console.error('❌ Arquivo .env não encontrado ou inválido.');
  process.exit(1);
}

if (!token) {
  console.error('❌ NPM_TOKEN não encontrado no .env');
  process.exit(1);
}

process.env.NPM_TOKEN = token;

console.log('📦 Atualizando plataforma base para a versão mais recente...');
try {
  execSync('npm install @sophiehf35/plataforma-base@latest', { stdio: 'inherit', shell: true });
  console.log('✅ Plataforma base atualizada.');
} catch (err) {
  console.error('❌ Erro ao instalar:', err.message);
  process.exit(1);
}