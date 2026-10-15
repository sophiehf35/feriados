// scripts/copy-static.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cp, copyFile, mkdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Arquivos/diretórios a serem copiados para o dist
const staticItems = [
  { src: 'dist/assets/portal.css', dest: 'dist/assets/portal.css' }, // já está no dist, mas vamos garantir
  // Adicione outros arquivos estáticos se necessário
];

async function copyStatic() {
  // Garante que a pasta assets existe
  await mkdir(path.resolve(distDir, 'assets'), { recursive: true });

  // Copia o portal.css gerado pelo Tailwind CLI (se existir)
  const cssSrc = path.resolve(rootDir, 'dist/assets/portal.css');
  const cssDest = path.resolve(distDir, 'assets/portal.css');
  if (fs.existsSync(cssSrc)) {
    await copyFile(cssSrc, cssDest);
    console.log('✅ Copiado: assets/portal.css');
  } else {
    console.warn('⚠️ portal.css não encontrado em dist/assets/');
  }

  // Copia outros arquivos estáticos se necessário
  // Exemplo: favicons, robots.txt, etc.
}

copyStatic().catch(err => {
  console.error('❌ Falha na cópia dos arquivos estáticos:', err);
  process.exit(1);
});