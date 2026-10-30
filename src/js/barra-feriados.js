// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');

    if (!selAno || !selEstado || !selCidade || !botao) return;

    const elCidades = document.getElementById('dados-barra-cidades');
    let cidadesRaw = null;
    if (elCidades) {
        try {
            const texto = elCidades.textContent.trim();
            if (texto) cidadesRaw = JSON.parse(texto);
        } catch (_) {}
    }

    const cacheCidades = {};

    // ─── Local ─────────────────────────────────────────────
    // Lê do objeto/array embutido no HTML. Funciona pro estado inicial
    // (e pra todos os estados, se o backend mandar tudo).
    function listaCidadesLocal(uf) {
        if (!uf || !cidadesRaw) return [];
        const ufNorm = String(uf).toLowerCase();

        if (!Array.isArray(cidadesRaw) && typeof cidadesRaw === 'object') {
            const chave = Object.keys(cidadesRaw)
                .find(k => k.toLowerCase() === ufNorm);
            return chave && Array.isArray(cidadesRaw[chave]) ? cidadesRaw[chave] : [];
        }

        if (Array.isArray(cidadesRaw)) {
            const temUf = cidadesRaw.some(c => c && c.uf);
            if (!temUf) return [];
            return cidadesRaw.filter(c =>
                c && String(c.uf || '').toLowerCase() === ufNorm
            );
        }

        return [];
    }

    // ─── Remoto ────────────────────────────────────────────
    // Busca via RPC do Supabase. Precisa de:
    //   • window.PORTAL_CONFIG.supabase_url
    //   • window.PORTAL_CONFIG.supabase_anon_key
    //   • RPC `get_cidades_por_uf(p_uf text)` no banco (ver SQL abaixo)
    async function listaCidadesRemoto(uf) {
        const cfg = window.PORTAL_CONFIG || {};
        const url = cfg.supabase_url;
        const key = cfg.supabase_anon_key;

        if (!url || !key || !uf) return [];

        try {
            const res = await fetch(`${url}/rest/v1/rpc/get_cidades_por_uf`, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ p_uf: String(uf).toLowerCase() }),
            });
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (_) {
            return [];
        }
    }

    // ─── Combinado ─────────────────────────────────────────
    async function obterCidades(uf) {
        if (!uf) return [];

        const local = listaCidadesLocal(uf);
        if (local.length) return local;

        const ufNorm = String(uf).toLowerCase();
        if (Array.isArray(cacheCidades[ufNorm])) return cacheCidades[ufNorm];

        const remoto = await listaCidadesRemoto(uf);
        if (remoto.length) cacheCidades[ufNorm] = remoto;
        return remoto;
    }

    // ─── Render ────────────────────────────────────────────
    async function preencherCidades(uf, selecionarSlug) {
        selCidade.innerHTML = '<option value="">Carregando...</option>';
        selCidade.disabled = true;

        const cidades = await obterCidades(uf);

        selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
        cidades.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.slug;
            opt.textContent = capitalizar(c.cidade);
            selCidade.appendChild(opt);
        });

        selCidade.disabled = false;

        if (selecionarSlug) {
            selCidade.value = selecionarSlug;
            if (selCidade.value !== selecionarSlug) selCidade.value = '';
        } else {
            selCidade.value = '';
        }
    }

    // Estado inicial (ex.: /2026/sp/ ou /2026/sp/sao-paulo/)
    if (selEstado.value) {
        preencherCidades(selEstado.value, selCidade.value);
    }

    // Troca de estado
    selEstado.addEventListener('change', function () {
        preencherCidades(this.value, '');
    });

    botao.addEventListener('click', function (e) {
        e.preventDefault();

        const ano = selAno.value;
        const uf = selEstado.value;
        const cidade = selCidade.value;

        if (!ano) {
            selAno.focus();
            return;
        }

        let destino = `/${ano}/`;
        if (uf && cidade) destino = `/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/${ano}/${uf}/`;

        window.location.href = destino;
    });
}