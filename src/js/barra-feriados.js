// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');

    if (!selAno || !selEstado || !selCidade || !botao) return;

    // ── 1. Lê o que o backend embutiu no HTML ──────────────
    let cidadesHtml = null;
    const elCidades = document.getElementById('dados-barra-cidades');
    if (elCidades) {
        try {
            const parsed = JSON.parse(elCidades.textContent.trim() || 'null');
            if (parsed && typeof parsed === 'object') cidadesHtml = parsed;
        } catch (_) {}
    }

    // Cache em memória — usado depois do fetch
    let cidadesCompletas = null; // sempre { uf: [...] }
    let fetchPromise = null;

    // Se o HTML já veio no formato objeto, usa direto
    if (cidadesHtml && !Array.isArray(cidadesHtml)) {
        cidadesCompletas = cidadesHtml;
    }

    console.log('[barra-feriados] cidadesHtml:', cidadesHtml);
    console.log('[barra-feriados] PORTAL_CONFIG keys:', Object.keys(window.PORTAL_CONFIG || {}));

    // ── 2. Fetch — busca TUDO se precisar ──────────────────
    function carregarTodasCidades() {
        if (cidadesCompletas) return Promise.resolve(cidadesCompletas);
        if (fetchPromise) return fetchPromise;

        const cfg = window.PORTAL_CONFIG || {};
        const url = cfg.supabase_url;
        const key = cfg.supabase_anon_key;

        if (!url || !key) {
            console.warn('[barra-feriados] supabase_url/supabase_anon_key ausentes no PORTAL_CONFIG');
            return Promise.resolve(null);
        }

        fetchPromise = fetch(`${url}/rest/v1/rpc/get_barra_feriados`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
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
                return null;
            })
            .catch(err => {
                console.warn('[barra-feriados] fetch falhou:', err);
                return null;
            });

        return fetchPromise;
    }

    // ── 3. Extrai lista de um UF ───────────────────────────
    function extrairLista(uf) {
        if (!uf) return [];
        const ufNorm = String(uf).toLowerCase();

        // Formato objeto (preferido): { uf: [...] }
        if (cidadesCompletas) {
            const chave = Object.keys(cidadesCompletas)
                .find(k => k.toLowerCase() === ufNorm);
            return chave && Array.isArray(cidadesCompletas[chave])
                ? cidadesCompletas[chave]
                : [];
        }

        // Formato array plano com .uf
        if (Array.isArray(cidadesHtml)) {
            const temUf = cidadesHtml.some(c => c && c.uf);
            if (temUf) {
                return cidadesHtml.filter(c =>
                    String(c.uf || '').toLowerCase() === ufNorm
                );
            }
            // Fallback antigo: backend mandou só do estado atual (sem .uf)
            return cidadesHtml;
        }

        return [];
    }

    // ── 4. Preenche o select ───────────────────────────────
    async function preencherCidades(uf, selecionarSlug) {
        if (!uf) {
            selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
            selCidade.value = '';
            return;
        }

        selCidade.innerHTML = '<option value="">Carregando...</option>';
        selCidade.disabled = true;

        let cidades = extrairLista(uf);

        // Se não achou localmente, tenta buscar do servidor
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

    // ── 5. Inicialização + eventos ─────────────────────────
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