// src/js/barra-feriados.js

import { capitalizar } from './utils.js';

export function inicializarBarraFeriados() {
    const selAno = document.getElementById('cmbAno');
    const selEstado = document.getElementById('cmbEstado');
    const selCidade = document.getElementById('cmbCidade');
    const botao = document.getElementById('botaoBuscar');
    if (!selAno || !selEstado || !selCidade || !botao) return;

    const elCidades = document.getElementById('dados-barra-cidades');
    let cidades = [];
    if (elCidades) {
        try { cidades = JSON.parse(elCidades.textContent.trim()) || []; } catch (_) {}
    }

    // Alguns UFs vêm em minúsculas no JSON
    const cidadesPorUf = Array.isArray(cidades) ? null : (cidades || {});

    function preencherCidades(uf) {
        selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';

        let lista = [];
        if (cidadesPorUf && cidadesPorUf[uf]) {
            lista = cidadesPorUf[uf];
        } else if (Array.isArray(cidades)) {
            // caso seja array plano (ex.: página do estado, só as cidades desse estado)
            lista = uf ? cidades : [];
        }

        lista.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.slug;
            opt.textContent = capitalizar(c.cidade);
            selCidade.appendChild(opt);
        });
    }

    selEstado.addEventListener('change', function () {
        preencherCidades(this.value);
    });

    selAno.addEventListener('change', function () {
        if (this.value) {
            this.style.border = '';
            this.style.background = '';
        }
    });

    botao.addEventListener('click', function () {
        const ano = selAno.value;
        const uf = selEstado.value;
        const cidade = selCidade.value;

        if (!ano) {
            selAno.style.border = '1px solid #f5c6cb';
            selAno.style.background = '#f8d7da';
            return;
        }

        let destino = `/feriados/${ano}/`;
        if (cidade) destino = `/feriados/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/feriados/${ano}/${uf}/`;

        window.location.href = destino;
    });
}