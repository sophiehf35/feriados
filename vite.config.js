// vite.config.js

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';
import { glob } from 'glob';
import path from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

function getEntries() {
  const entries = {};

  glob.sync('src/js/**/*.js', { absolute: false }).forEach(file => {
    if (file.includes('/vendor/')) return;
    const name = path.basename(file, '.js');
    entries[name] = file;
  });

  glob.sync('src/css/**/*.css', { absolute: false }).forEach(file => {
    if (file.includes('/vendor/')) return;
    const name = path.basename(file, '.css');
    if (name === 'input') return;
    entries['css-' + name] = file;
  });

  return entries;
}

function pluginCopiarVendor() {
  return {
    name: 'copiar-vendor',
    generateBundle() {
      const pastas = [
        { origem: 'src/js/vendor',  destino: 'assets/js/vendor',  ext: '.js'  },
        { origem: 'src/css/vendor', destino: 'assets/css/vendor', ext: '.css' },
      ];

      pastas.forEach(({ origem, destino, ext }) => {
        const abs = path.resolve(process.cwd(), origem);
        if (!existsSync(abs)) {
          console.log(`[copiar-vendor] pasta não existe: ${origem}`);
          return;
        }

        const arquivos = readdirSync(abs).filter(f => f.endsWith(ext));
        arquivos.forEach(arquivo => {
          this.emitFile({
            type: 'asset',
            fileName: `${destino}/${arquivo}`,
            source: readFileSync(path.join(abs, arquivo)),
          });
        });

        console.log(`[copiar-vendor] ${arquivos.length} arquivo(s) ${origem} → dist/${destino}/`);
      });
    },
  };
}

function pluginJsonAssets() {
  return {
    name: 'json-assets',
    generateBundle() {
      const origem = path.resolve(process.cwd(), 'src/json');
      if (!existsSync(origem)) return;
      const arquivos = readdirSync(origem).filter(f => f.endsWith('.json'));
      arquivos.forEach(arquivo => {
        const conteudo = readFileSync(path.join(origem, arquivo), 'utf-8');
        this.emitFile({
          type: 'asset',
          fileName: 'assets/json/' + arquivo,
          source: conteudo,
        });
      });
      console.log(`[json-assets] ${arquivos.length} arquivo(s) → dist/assets/json/`);
    },
  };
}

const branch = process.env.CF_PAGES_BRANCH || 'unknown';
const isProduction = branch === 'main' || branch === 'master';

export default defineConfig({
  publicDir: 'public',

  plugins: [
    tailwindcss(),
    pluginCopiarVendor(),
    pluginJsonAssets(),
    ...(isProduction
      ? [
          javascriptObfuscator({
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: false,
            debugProtection: true,
            debugProtectionInterval: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'mangled',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 5,
            stringArray: true,
            stringArrayEncoding: ['rc4'],
            stringArrayThreshold: 1,
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
          }),
        ]
      : []),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    manifest: 'assets/manifest.json',
    minify: isProduction ? 'esbuild' : false,
    cssCodeSplit: true,
    rollupOptions: {
      input: getEntries(),
      output: {
        entryFileNames: (chunkInfo) => {
          const nome = chunkInfo.name;
          if (nome.startsWith('css-')) {
            return `assets/css-stubs/${nome.slice(4)}.js`;
          }
          return `assets/js/${nome}.[hash].js`;
        },
        chunkFileNames: 'assets/js/chunk-[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            let nome = assetInfo.name.replace(/\.css$/, '');
            if (nome.startsWith('css-')) {
              nome = nome.slice(4);
            }
            return `assets/css/${nome}.[hash].css`;
          }
          return `assets/[ext]/[name].[hash].[ext]`;
        },
      },
    },
  },
});