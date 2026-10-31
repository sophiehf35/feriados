// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');

    if (!selAno || !selEstado || !selCidade || !botao) return;

    let cidadesPorUf = null;
    const elCidades = document.getElementById('dados-barra-cidades');
    if (elCidades) {
        try {
            const parsed = JSON.parse(elCidades.textContent.trim() || 'null');
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                cidadesPorUf = parsed;
            } else if (Array.isArray(parsed)) {
                console.error(
                    '[barra-feriados] <script id="dados-barra-cidades"> veio como ARRAY. ' +
                    'O backend precisa chamar get_barra_feriados() SEM p_uf.'
                );
            }
        } catch (e) {
            console.error('[barra-feriados] JSON inválido em dados-barra-cidades:', e);
        }
    }

    function listaCidades(uf) {
        if (!uf || !cidadesPorUf) return [];
        const ufNorm = String(uf).toLowerCase();
        const chave = Object.keys(cidadesPorUf).find(k => k.toLowerCase() === ufNorm);
        return chave && Array.isArray(cidadesPorUf[chave]) ? cidadesPorUf[chave] : [];
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