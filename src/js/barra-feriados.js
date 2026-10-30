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

    // Aceita 2 formatos:
    //   1. Objeto:  { "sp": [{slug, cidade}, ...], "rj": [...] }
    //   2. Array:   [{slug, cidade, uf}, ...]   (filtra por c.uf)
    // Comparação de UF é case-insensitive ("SP" == "sp").
    function listaCidades(uf) {
        if (!uf || !cidadesRaw) return [];
        const ufNorm = String(uf).toLowerCase();

        // Formato 1 — objeto { uf: [...] }
        if (!Array.isArray(cidadesRaw) && typeof cidadesRaw === 'object') {
            const chave = Object.keys(cidadesRaw)
                .find(k => k.toLowerCase() === ufNorm);
            return chave && Array.isArray(cidadesRaw[chave]) ? cidadesRaw[chave] : [];
        }

        // Formato 2 — array plano
        if (Array.isArray(cidadesRaw)) {
            const temUf = cidadesRaw.some(c => c && c.uf);
            if (!temUf) return cidadesRaw; // se não há .uf, não dá pra filtrar
            return cidadesRaw.filter(c =>
                c && String(c.uf || '').toLowerCase() === ufNorm
            );
        }

        return [];
    }

    function preencherCidades(uf, selecionarSlug) {
        selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';

        const cidades = listaCidades(uf);
        cidades.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.slug;
            opt.textContent = capitalizar(c.cidade);
            selCidade.appendChild(opt);
        });

        // Se veio uma cidade pré-selecionada (ex.: /2026/sp/sao-paulo/),
        // tenta marcar. Se não existir na lista, deixa vazio.
        if (selecionarSlug) {
            selCidade.value = selecionarSlug;
            if (selCidade.value !== selecionarSlug) selCidade.value = '';
        } else {
            selCidade.value = '';
        }
    }

    // Se a página já veio com estado definido (ex.: /2026/sp/),
    // carrega as cidades desse estado com o slug atual marcado (se for o caso).
    if (selEstado.value) {
        preencherCidades(selEstado.value, selCidade.value);
    }

    // Troca de estado: SEMPRE repopula as cidades do novo estado
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

        // URL: /{ano}/  |  /{ano}/{uf}/  |  /{ano}/{uf}/{cidade}/
        let destino = `/${ano}/`;
        if (uf && cidade) destino = `/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/${ano}/${uf}/`;

        window.location.href = destino;
    });
}