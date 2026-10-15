// src/rotas/feriados.js

import { render as renderAno } from '../renderizadores/feriados/ano.js';
import { render as renderEstado } from '../renderizadores/feriados/estado.js';
import { render as renderMes } from '../renderizadores/feriados/mes.js';
import { render as renderCidade } from '../renderizadores/feriados/cidade.js';

export async function resolver({ supabase, slugParts, config, scriptsAdicionaisBase, url }) {
    if (slugParts.length === 0) return null;

    const ano = slugParts[0];
    if (!/^\d{4}$/.test(ano)) return null;

    // Uma única chamada ao banco. A barra vem dentro do próprio RPC.
    if (slugParts.length === 1) {
        const { data, error } = await supabase.rpc('get_ano', { p_ano: ano });
        if (error || !data || data.length === 0) return null;
        return { html: renderAno(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase }), status: 200 };
    }

    if (slugParts.length === 2) {
        const slug = slugParts[1];

        if (slug.length === 2) {
            const { data, error } = await supabase.rpc('get_estado', { p_slug: slug, p_ano: ano });
            if (error || !data || data.length === 0) return null;
            return { html: renderEstado(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase }), status: 200 };
        }

        const { data, error } = await supabase.rpc('get_mes', { p_slug: slug, p_ano: ano });
        if (error || !data || data.length === 0) return null;
        return { html: renderMes(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase }), status: 200 };
    }

    if (slugParts.length === 3) {
        const uf = slugParts[1];
        const cidadeSlug = slugParts[2];
        const { data, error } = await supabase.rpc('get_cidade', { p_slug: cidadeSlug, p_ano: ano });
        if (error || !data || data.length === 0) return null;
        return { html: renderCidade(config, data[0], { scriptsAdicionais: scriptsAdicionaisBase }), status: 200 };
    }

    return null;
}