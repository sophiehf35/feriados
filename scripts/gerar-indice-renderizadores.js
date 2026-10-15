// scripts/gerar-indice-renderizadores.js
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chokidar from 'chokidar';

const PASTAS = [
    'src/renderizadores/paginas',
    'src/renderizadores/ferramentas',
    'src/renderizadores/sitemaps',
    'src/renderizadores/feriados',
    'src/rotas'
];

function gerarIndice(pastaRelativa) {
    const absoluta = join(process.cwd(), pastaRelativa);

    if (!existsSync(absoluta)) {
        mkdirSync(absoluta, { recursive: true });
        console.log(`[índice] pasta criada: ${pastaRelativa}`);
    }

    const arquivos = readdirSync(absoluta)
        .filter(f => f.endsWith('.js') && !f.startsWith('_'));

    const imports = [];
    const entradas = [];

    for (const arquivo of arquivos) {
        const slug = arquivo.replace('.js', '');
        const id = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        imports.push(`import * as ${id} from './${arquivo}';`);
        entradas.push(`    '${slug}': ${id}`);
    }

    let nomeExport = 'mapa';
    if (pastaRelativa.endsWith('/rotas')) nomeExport = 'rotas';

    const conteudo = `// ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE À MÃO
// Gerado por scripts/gerar-indice-renderizadores.js
// Fonte: ${pastaRelativa}/

${imports.join('\n')}

export const ${nomeExport} = {
${entradas.join(',\n')}
};
`;

    writeFileSync(join(absoluta, '_indice.js'), conteudo);
    writeFileSync(
        join(absoluta, '_manifest.json'),
        JSON.stringify(arquivos.map(f => f.replace('.js', '')), null, 2)
    );
    console.log(`[índice] ${arquivos.length} itens em ${pastaRelativa}`);
}

function gerarTodos() {
    for (const pasta of PASTAS) {
        gerarIndice(pasta);
    }
}

if (process.argv.includes('--watch')) {
    gerarTodos();
    console.log('[índice] watch ativo');

    const watcher = chokidar.watch(PASTAS, {
        ignoreInitial: true,
        ignored: /_indice\.js$|_manifest\.json$/,
        awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
    });

    watcher.on('all', (evento, arquivo) => {
        console.log(`[índice] ${evento}: ${arquivo}`);
        gerarTodos();
    });
} else {
    gerarTodos();
}