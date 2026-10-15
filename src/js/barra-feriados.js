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
        try { cidades = JSON.parse(elCidades.textContent.trim()) || []; } catch {}
    }

    selEstado.addEventListener('change', function () {
        selCidade.innerHTML = '<option value="">Selecione a Cidade</option>';
        if (!this.value) return;
        cidades.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.slug;
            opt.textContent = capitalizar(c.cidade);
            selCidade.appendChild(opt);
        });
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

        let destino = `/${ano}/`;
        if (cidade) destino = `/${ano}/${uf}/${cidade}/`;
        else if (uf) destino = `/${ano}/${uf}/`;

        window.location.href = destino;
    });
}