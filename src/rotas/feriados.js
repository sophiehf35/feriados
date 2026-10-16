// src/rotas/feriados.js

import { mapa as renderizadores } from '../renderizadores/feriados/_indice.js';

export async function resolver({ supabase, slugParts, config, scriptsAdicionaisBase, url }) {
    if (slugParts.length === 0) return null;

    const ano = slugParts[0];
    if (!/^\d{4}$/.test(ano)) return null;

    // === /2025/ ===
    if (slugParts.length === 1) {
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

    // === /2025/sp/ ou /2025/janeiro/ ===
    if (slugParts.length === 2) {
        const slug = slugParts[1];

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

    // === /2025/sp/saopaulo/ ===
    if (slugParts.length === 3) {
        const cidadeSlug = slugParts[2];

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
