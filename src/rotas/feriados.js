// src/rotas/feriados.js

import { mapa as renderizadores } from '../renderizadores/feriados/_indice.js';

const RE_ANO = /^\d{4}$/;

function naoEncontrado(msg) {
    return {
        html: `<main class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-16 text-center">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">Página não encontrada</h1>
            <p class="text-gray-600 mb-6">${msg}</p>
            <a href="/" class="inline-block px-5 py-2.5 rounded-md bg-botao-acao text-white font-semibold hover:brightness-110">Voltar para a home</a>
        </main>`,
        status: 404,
    };
}

function erroInterno(msg, extra) {
    console.error('[feriados]', msg, extra);
    return {
        html: `<main class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-16 text-center">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">Erro ao carregar</h1>
            <p class="text-gray-600">Tente novamente em instantes.</p>
        </main>`,
        status: 500,
    };
}

export async function resolver({ supabase, slugParts, config, scriptsAdicionaisBase, url }) {
    if (!RE_ANO.test(slugParts[0])) return null;

    const parts = slugParts;
    const ano = parts[0];

    try {
        // /2026/
        if (parts.length === 1) {
            const mod = renderizadores['ano'];
            if (!mod?.render) return erroInterno('renderizador "ano" ausente');

            const { data, error } = await supabase.rpc('get_ano', { p_ano: ano });
            if (error) return erroInterno('RPC get_ano', error);
            if (!data?.length) return naoEncontrado(`Não há dados para o ano ${ano}.`);

            // Busca comparação em paralelo (não bloqueia se falhar)
            const comp = await supabase.rpc('get_comparacao_ano', { p_ano: ano });
            data[0].comparacao = (comp && !comp.error && comp.data) ? comp.data : null;
            data[0].ano = data[0].ano || ano;

            return {
                html: mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url }),
                status: 200,
            };
        }

        // /2026/sp/ ou /2026/janeiro/
        if (parts.length === 2) {
            const slug = parts[1];

            if (slug.length === 2) {
                const mod = renderizadores['estado'];
                if (!mod?.render) return erroInterno('renderizador "estado" ausente');

                const { data, error } = await supabase.rpc('get_estado', { p_slug: slug, p_ano: ano });
                if (error) return erroInterno('RPC get_estado', error);
                if (!data?.length) return naoEncontrado(`Estado "${slug.toUpperCase()}" não encontrado.`);

                data[0].ano = ano;
                return {
                    html: mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url }),
                    status: 200,
                };
            }

            const mod = renderizadores['mes'];
            if (!mod?.render) return erroInterno('renderizador "mes" ausente');

            const { data, error } = await supabase.rpc('get_mes', { p_slug: slug, p_ano: ano });
            if (error) {
                if (String(error.message || '').includes('Nome do mês inválido')) {
                    return naoEncontrado(`Mês "${slug}" não encontrado.`);
                }
                return erroInterno('RPC get_mes', error);
            }
            if (!data?.length) return naoEncontrado(`Mês "${slug}" não encontrado.`);

            data[0].ano = ano;
            return {
                html: mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url }),
                status: 200,
            };
        }

        // /2026/pr/abatia-pr/
        if (parts.length === 3) {
            const cidadeSlug = parts[2];
            const mod = renderizadores['cidade'];
            if (!mod?.render) return erroInterno('renderizador "cidade" ausente');

            const { data, error } = await supabase.rpc('get_cidade', { p_slug: cidadeSlug, p_ano: ano });
            if (error) return erroInterno('RPC get_cidade', error);
            if (!data?.length) return naoEncontrado(`Cidade "${cidadeSlug}" não encontrada.`);

            data[0].ano = ano;
            return {
                html: mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url }),
                status: 200,
            };
        }

        return naoEncontrado('URL inválida.');
    } catch (err) {
        return erroInterno('resolver', err?.stack || String(err));
    }
}