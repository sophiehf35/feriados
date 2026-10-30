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

    // Cache do objeto completo { uf: [{slug, cidade}, ...] }
    let cidadesCompletas = null;

    // Se o HTML já veio no formato objeto, usa direto
    if (cidadesRaw && !Array.isArray(cidadesRaw) && typeof cidadesRaw === 'object') {
        cidadesCompletas = cidadesRaw;
    }

    // ─── Fetch (só se precisar) ────────────────────────────
    // Chama a MESMA RPC sem p_uf → retorna { uf: [...] } de todos os estados.
    async function carregarTodasCidades() {
        if (cidadesCompletas) return cidadesCompletas;

        const cfg = window.PORTAL_CONFIG || {};
        const url = cfg.supabase_url;
        const key = cfg.supabase_anon_key;

        if (!url || !key) return null;

        try {
            const res = await fetch(`${url}/rest/v1/rpc/get_barra_feriados`, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data && typeof data === 'object' && data.cidades && !Array.isArray(data.cidades)) {
                cidadesCompletas = data.cidades;
                return cidadesCompletas;
            }
            return null;
        } catch (_) {
            return null;
        }
    }

    // ─── Lista local (fallback quando o fetch falha) ──────
    function listaCidadesLocal(uf) {
        if (!uf) return [];
        const ufNorm = String(uf).toLowerCase();

        // Objeto { uf: [...] }
        if (cidadesCompletas) {
            const chave = Object.keys(cidadesCompletas)
                .find(k => k.toLowerCase() === ufNorm);
            return chave ? cidadesCompletas[chave] : [];
        }

        // Array plano (fallback do backend atual)
        if (Array.isArray(cidadesRaw)) {
            const temUf = cidadesRaw.some(c => c && c.uf);
            if (temUf) {
                return cidadesRaw.filter(c =>
                    String(c.uf || '').toLowerCase() === ufNorm
                );
            }
            return cidadesRaw; // sem .uf → mantém comportamento antigo
        }

        return [];
    }

    async function obterCidades(uf) {
        if (!uf) return [];
        // Se já temos o objeto completo, não precisa de fetch
        if (cidadesCompletas) return listaCidadesLocal(uf);
        // Tenta carregar tudo 1 vez
        const carregado = await carregarTodasCidades();
        if (carregado) return listaCidadesLocal(uf);
        // Fallback: só o que estava no HTML
        return listaCidadesLocal(uf);
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

    if (selEstado.value) {
        preencherCidades(selEstado.value, selCidade.value);
    }

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