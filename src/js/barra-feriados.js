// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');

    if (!selAno || !selEstado || !selCidade || !botao) {
        console.warn('[barra-feriados] faltam elementos:', {
            cmbAno: !!selAno, cmbEstado: !!selEstado,
            cmbCidade: !!selCidade, botaoBuscar: !!botao,
        });
        return;
    }

    const elCidades = document.getElementById('dados-barra-cidades');
    let cidadesRaw = null;
    if (elCidades) {
        try {
            const texto = elCidades.textContent.trim();
            if (texto && texto !== 'undefined' && texto !== 'null' && texto !== '[]') {
                cidadesRaw = JSON.parse(texto);
            }
        } catch (e) {
            console.warn('[barra-feriados] JSON inválido:', e);
        }
    }

    const estadoInicial = selEstado.value;
    const cidadeInicial = selCidade.value;

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

    // Auto-carregar as cidades se a página já veio com um estado selecionado
    if (estadoInicial) {
        preencherCidades(estadoInicial, cidadeInicial);
    }

    selEstado.addEventListener('change', function () {
        preencherCidades(this.value, '');
    });

    selAno.addEventListener('change', function () {
        if (this.value) {
            this.style.border = '';
            this.style.background = '';
        }
    });

    botao.addEventListener('click', function (e) {
        e.preventDefault();

        const ano = selAno.value;
        const uf = selEstado.value;
        const cidade = selCidade.value;

        if (!ano) {
            selAno.style.border = '1px solid #f5c6cb';
            selAno.style.background = '#f8d7da';
            selAno.focus();
            return;
        }

        let destino = `/feriados/${ano}/`;
        if (cidade && uf) destino = `/feriados/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/feriados/${ano}/${uf}/`;

        window.location.href = destino;
    });

    console.log('[barra-feriados] pronto. estadoInicial:', estadoInicial, 'cidadeInicial:', cidadeInicial);
}