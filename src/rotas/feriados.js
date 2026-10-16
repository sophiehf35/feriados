// src/rotas/feriados.js

import { mapa as renderizadores } from '../renderizadores/feriados/_indice.js';

export async function resolver({ supabase, slugParts, config, scriptsAdicionaisBase, url }) {
    if (slugParts[0] !== 'feriados') return null;

    const parts = slugParts.slice(1);
    if (parts.length === 0) return null;

    const ano = parts[0];
    if (!/^\d{4}$/.test(ano)) return null;

    // /feriados/2025/
    if (parts.length === 1) {
        const mod = renderizadores['ano'];
        if (!mod || typeof mod.render !== 'function') return null;

        const { data, error } = await supabase.rpc('get_ano', { p_ano: ano });
        if (error || !data || data.length === 0) return null;

        const html = mod.render(config, data[0], {
            scriptsAdicionais: scriptsAdicionaisBase,
            url
        });
        return { html, status: 200 };
    }

    // /feriados/2025/sp/  ou  /feriados/2025/janeiro/
    if (parts.length === 2) {
        const slug = parts[1];

        if (slug.length === 2) {
            const mod = renderizadores['estado'];
            if (!mod || typeof mod.render !== 'function') return null;

            const { data, error } = await supabase.rpc('get_estado', { p_slug: slug, p_ano: ano });
            if (error || !data || data.length === 0) return null;

            const html = mod.render(config, data[0], {
                scriptsAdicionais: scriptsAdicionaisBase,
                url
            });
            return { html, status: 200 };
        }

        const mod = renderizadores['mes'];
        if (!mod || typeof mod.render !== 'function') return null;

        const { data, error } = await supabase.rpc('get_mes', { p_slug: slug, p_ano: ano });
        if (error || !data || data.length === 0) return null;

        const html = mod.render(config, data[0], {
            scriptsAdicionais: scriptsAdicionaisBase,
            url
        });
        return { html, status: 200 };
    }

    // /feriados/2025/sp/saopaulo/
    if (parts.length === 3) {
        const cidadeSlug = parts[2];

        const mod = renderizadores['cidade'];
        if (!mod || typeof mod.render !== 'function') return null;

        const { data, error } = await supabase.rpc('get_cidade', { p_slug: cidadeSlug, p_ano: ano });
        if (error || !data || data.length === 0) return null;

        const html = mod.render(config, data[0], {
            scriptsAdicionais: scriptsAdicionaisBase,
            url
        });
        return { html, status: 200 };
    }

    return null;
}
