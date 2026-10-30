// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');

    if (!selAno || !selEstado || !selCidade || !botao) return;

    // UF "dona" da página (ex.: /2026/mt/ → "mt"). Vem do <h1 data-uf>.
    const h1 = document.querySelector('h1');
    const ufInicial = String(h1?.dataset?.uf || '').toLowerCase();

    // Lê o que o backend embutiu no HTML.
    let cidadesHtml = null;
    const elCidades = document.getElementById('dados-barra-cidades');
    if (elCidades) {
        try {
            const parsed = JSON.parse(elCidades.textContent.trim() || 'null');
            if (parsed && typeof parsed === 'object') cidadesHtml = parsed;
        } catch (_) {}
    }

    // Cache do objeto completo { uf: [...] } preenchido pelo fetch.
    let cidadesCompletas = null;
    let fetchPromise = null;

    // Se o HTML já veio como objeto { uf: [...] }, usa direto.
    if (cidadesHtml && !Array.isArray(cidadesHtml)) {
        cidadesCompletas = cidadesHtml;
    }

    // ── Fetch: todas as cidades agrupadas por UF ───────────
    function carregarTodasCidades() {
        if (cidadesCompletas) return Promise.resolve(cidadesCompletas);
        if (fetchPromise) return fetchPromise;

        const cfg = window.PORTAL_CONFIG || {};
        const url = cfg.supabase_url;
        const key = cfg.supabase_anon_key;

        if (!url || !key) {
            console.warn('[barra-feriados] PORTAL_CONFIG.supabase_url e/ou supabase_anon_key ausentes — troca de estado não vai funcionar. Adicione no render que gera window.PORTAL_CONFIG.');
            return Promise.resolve(null);
        }

        fetchPromise = fetch(`${url}/rest/v1/rpc/get_barra_feriados`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // sem p_uf → RPC retorna { uf: [...] } de TODOS os estados
        })
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(data => {
                const cid = data && data.cidades;
                if (cid && typeof cid === 'object' && !Array.isArray(cid)) {
                    cidadesCompletas = cid;
                    return cidadesCompletas;
                }
                console.warn('[barra-feriados] RPC respondeu sem cidades agrupadas por UF');
                return null;
            })
            .catch(err => {
                console.warn('[barra-feriados] fetch falhou:', err);
                return null;
            });

        return fetchPromise;
    }

    // ── Extrai lista de um UF ──────────────────────────────
    // Regras:
    //   • { uf: [...] } → filtra direto (após fetch)
    //   • array com .uf em cada item → filtra por .uf
    //   • array SEM .uf → SÓ usa se o UF pedido for o UF da própria página
    //                     (backend mandou só do estado inicial). Pedindo
    //                     outro UF, retorna [] → força o fetch.
    function extrairLista(uf) {
        if (!uf) return [];
        const ufNorm = String(uf).toLowerCase();

        // Objeto por UF (depois do fetch, ou se o backend já mandou assim)
        if (cidadesCompletas) {
            const chave = Object.keys(cidadesCompletas)
                .find(k => k.toLowerCase() === ufNorm);
            return chave && Array.isArray(cidadesCompletas[chave])
                ? cidadesCompletas[chave]
                : [];
        }

        // Array plano (vem do HTML antes do fetch)
        if (Array.isArray(cidadesHtml)) {
            const temUf = cidadesHtml.some(c => c && c.uf);
            if (temUf) {
                return cidadesHtml.filter(c =>
                    String(c.uf || '').toLowerCase() === ufNorm
                );
            }
            // Sem .uf → só serve pro estado da própria página.
            if (ufNorm === ufInicial) return cidadesHtml;
            return []; // força o fetch
        }

        return [];
    }

    // ── Preenche o select ──────────────────────────────────
    async function preencherCidades(uf, selecionarSlug) {
        if (!uf) {
            selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
            selCidade.value = '';
            return;
        }

        selCidade.innerHTML = '<option value="">Carregando...</option>';
        selCidade.disabled = true;

        let cidades = extrairLista(uf);

        // Não achou localmente → busca todas do servidor
        if (!cidades.length) {
            const carregado = await carregarTodasCidades();
            if (carregado) cidades = extrairLista(uf);
        }

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

    // ── Inicialização + eventos ────────────────────────────
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