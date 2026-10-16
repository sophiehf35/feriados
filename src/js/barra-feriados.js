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

    function listaCidades(uf) {
        if (!uf) return [];
        if (Array.isArray(cidadesRaw)) return cidadesRaw;
        if (cidadesRaw && typeof cidadesRaw === 'object' && Array.isArray(cidadesRaw[uf])) {
            return cidadesRaw[uf];
        }
        return [];
    }

    function preencherCidades(uf, selecionarSlug) {
        selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
        listaCidades(uf).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.slug;
            opt.textContent = capitalizar(c.cidade);
            selCidade.appendChild(opt);
        });
        if (selecionarSlug) {
            selCidade.value = selecionarSlug;
            if (selCidade.value !== selecionarSlug) selCidade.value = '';
        }
    }

    // Se a página já veio com estado definido (ex.: /feriados/2025/sp/),
    // carrega as cidades desse estado com o slug atual marcado.
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

        let destino = `/feriados/${ano}/`;
        if (uf && cidade) destino = `/feriados/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/feriados/${ano}/${uf}/`;

        window.location.href = destino;
    });
}