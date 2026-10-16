// src/rotas/feriados.js

import { mapa as renderizadores } from '../renderizadores/feriados/_indice.js';

const PREFIXO = 'feriados';

function debugHtml(msg, extra = '') {
    return `<pre style="background:#1111;color:#0f0;padding:20px;font-size:14px;white-space:pre-wrap;">[feriados debug]
${msg}
${extra}</pre>`;
}

export async function resolver({ supabase, slugParts, config, scriptsAdicionaisBase, url }) {
    try {
        if (slugParts[0] !== PREFIXO) return null;

        const parts = slugParts.slice(1);
        if (parts.length === 0) {
            return { html: debugHtml('parts.length === 0 (URL só /feriados/)'), status: 200 };
        }

        const ano = parts[0];
        if (!/^\d{4}$/.test(ano)) {
            return { html: debugHtml('ano inválido: ' + ano), status: 200 };
        }

        // /feriados/2025/
        if (parts.length === 1) {
            const mod = renderizadores['ano'];
            if (!mod || typeof mod.render !== 'function') {
                return { html: debugHtml('renderizador "ano" não encontrado no _indice.js', JSON.stringify(Object.keys(renderizadores))), status: 200 };
            }

            const { data, error } = await supabase.rpc('get_ano', { p_ano: ano });
            if (error) {
                return { html: debugHtml('RPC get_ano erro:', JSON.stringify(error, null, 2)), status: 200 };
            }
            if (!data || data.length === 0) {
                return { html: debugHtml('RPC get_ano devolveu vazio para ano ' + ano), status: 200 };
            }

            try {
                data[0].ano = data[0].ano || ano;
                const html = mod.render(config, data[0], {
                    scriptsAdicionais: scriptsAdicionaisBase,
                    url
                });
                return { html, status: 200 };
            } catch (e) {
                return { html: debugHtml('renderAno rebentou:', (e && e.stack) || String(e)), status: 200 };
            }
        }

        // /feriados/2025/sp/ ou /feriados/2025/janeiro/
        if (parts.length === 2) {
            const slug = parts[1];

            if (slug.length === 2) {
                const mod = renderizadores['estado'];
                if (!mod || typeof mod.render !== 'function') {
                    return { html: debugHtml('renderizador "estado" não encontrado'), status: 200 };
                }
                const { data, error } = await supabase.rpc('get_estado', { p_slug: slug, p_ano: ano });
                if (error) return { html: debugHtml('RPC get_estado erro:', JSON.stringify(error, null, 2)), status: 200 };
                if (!data || data.length === 0) return { html: debugHtml('RPC get_estado vazio para ' + slug + '/' + ano), status: 200 };
                try {
                    data[0].ano = ano;
                    const html = mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url });
                    return { html, status: 200 };
                } catch (e) {
                    return { html: debugHtml('renderEstado rebentou:', (e && e.stack) || String(e)), status: 200 };
                }
            }

            const mod = renderizadores['mes'];
            if (!mod || typeof mod.render !== 'function') {
                return { html: debugHtml('renderizador "mes" não encontrado'), status: 200 };
            }
            const { data, error } = await supabase.rpc('get_mes', { p_slug: slug, p_ano: ano });
            if (error) return { html: debugHtml('RPC get_mes erro:', JSON.stringify(error, null, 2)), status: 200 };
            if (!data || data.length === 0) return { html: debugHtml('RPC get_mes vazio para ' + slug + '/' + ano), status: 200 };
            try {
                data[0].ano = ano;
                const html = mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url });
                return { html, status: 200 };
            } catch (e) {
                return { html: debugHtml('renderMes rebentou:', (e && e.stack) || String(e)), status: 200 };
            }
        }

        // /feriados/2025/sp/saopaulo/
        if (parts.length === 3) {
            const cidadeSlug = parts[2];
            const mod = renderizadores['cidade'];
            if (!mod || typeof mod.render !== 'function') {
                return { html: debugHtml('renderizador "cidade" não encontrado'), status: 200 };
            }
            const { data, error } = await supabase.rpc('get_cidade', { p_slug: cidadeSlug, p_ano: ano });
            if (error) return { html: debugHtml('RPC get_cidade erro:', JSON.stringify(error, null, 2)), status: 200 };
            if (!data || data.length === 0) return { html: debugHtml('RPC get_cidade vazio para ' + cidadeSlug + '/' + ano), status: 200 };
            try {
                data[0].ano = ano;
                const html = mod.render(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase, url });
                return { html, status: 200 };
            } catch (e) {
                return { html: debugHtml('renderCidade rebentou:', (e && e.stack) || String(e)), status: 200 };
            }
        }

        return { html: debugHtml('slugParts inesperado:', JSON.stringify(slugParts)), status: 200 };
    } catch (err) {
        return { html: debugHtml('resolver rebentou antes de tudo:', (err && err.stack) || String(err)), status: 200 };
    }
}