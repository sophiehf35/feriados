// src/js/main.js

import '../css/input.css';
import { initFlowbite } from 'flowbite';
import VanillaCalendar from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/build/vanilla-calendar.min.css';
import {
    inicializarCarregamentoImagens,
    configurarValidacaoContato,
    configurarValidacaoComentario,
    iniciarAnalytics,
    inicializarMenuMobile,
    inicializarMenuDesktop
} from '@sophiehf35/plataforma-base/client';

import './validador-comentario-feriados.js';
import { inicializarBarraFeriados } from './barra-feriados.js';
import { TabelaGenerica } from './tabela.js';
import { decodeData, escapeHtml } from './utils.js';
import { inicializarAnaliseFeriados } from './analise-feriados.js';

window.configurarValidacaoComentario = configurarValidacaoComentario;

const config = window.PORTAL_CONFIG || {};

function inicializarFlowbite() {
    try { initFlowbite(); } catch (_) {}
}

function inicializarFormularioContato() {
    const form = document.getElementById('formulario_de_contato');
    if (!form) return;

    let camposObrigatorios = [];
    if (window.__FALE_CONOSCO_CONFIG?.camposObrigatorios) {
        camposObrigatorios = window.__FALE_CONOSCO_CONFIG.camposObrigatorios;
    } else if (form.dataset.camposObrigatorios) {
        try {
            camposObrigatorios = JSON.parse(form.dataset.camposObrigatorios);
        } catch (_) {
            camposObrigatorios = form.dataset.camposObrigatorios.split(',').map(s => s.trim());
        }
    }

    configurarValidacaoContato('#formulario_de_contato', camposObrigatorios, '/api/fale-conosco');
}

function inicializarAnalyticsPortal() {
    if (config.possui_google_analytics) {
        iniciarAnalytics(config);
    }
}

function pegaNumeroMes(nomeDoMes) {
    const nomes = ['janeiro','fevereiro','março','abril','maio','junho',
                   'julho','agosto','setembro','outubro','novembro','dezembro'];
    return nomes.indexOf((nomeDoMes || '').toLowerCase());
}

function inicializarCalendario() {
    const el = document.getElementById('calendario-de-feriados');
    if (!el) return;

    const h1 = document.querySelector('h1');
    if (!h1) return;

    const feriados = window.__FERIADOS__ || {};
    const tipoPagina = h1.dataset.tipoPagina;
    const ano = h1.dataset.ano || new Date().getFullYear();

    const popups = {};
    for (const data in feriados) {
        if (Object.prototype.hasOwnProperty.call(feriados, data)) {
            const f = feriados[data];
            popups[data] = {
                modifier: f.classe,
                html: `<div class="popup-feriado"><strong>${f.tipo}</strong><br>${f.nome}${f.descricao ? ' (' + f.descricao + ')' : ''}</div>`,
            };
        }
    }

    const calendar = new VanillaCalendar(el, {
        type: tipoPagina !== 'mes' ? 'multiple' : 'default',
        months: tipoPagina !== 'mes' ? 12 : 1,
        settings: {
            lang: 'pt-br',
            visibility: { theme: 'light', weekend: false, daysOutside: false },
            selection: { day: false, month: false, year: false },
            selected: {
                year: parseInt(ano, 10),
                month: tipoPagina !== 'mes' ? 0 : pegaNumeroMes(h1.dataset.mes),
            },
        },
        popups: popups,
    });

    calendar.init();
}

function inicializarTabelaFeriados() {
    const tabela = document.querySelector('table.tabela-customizada.feriados');
    if (!tabela) return;

    const acessoMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (acessoMobile) {
        document.querySelectorAll('table.tabela-customizada.feriados > tbody > tr > td.th').forEach(linha => {
            const mes = linha.textContent.split(' ').splice(-1)[0];
            linha.textContent = linha.textContent.replace(mes, mes.substring(0, 3));
        });

        document.querySelectorAll('table.tabela-customizada.feriados > tbody > tr > td:nth-child(2)').forEach(linha => {
            const match = linha.textContent.match(/\(([^)]+)\)/);
            if (match) {
                const descricao = match[1];
                linha.textContent = linha.textContent.replace(match[1], '').replace('()', '');

                const btn = document.createElement('button');
                btn.style.cssText = 'padding:5px;line-height:10px;float:right;text-transform:lowercase;';
                btn.className = 'botaoDescricao fechado';
                btn.type = 'button';
                btn.textContent = 'ver';
                btn.dataset.descricao = descricao;
                linha.appendChild(btn);
            }
        });
        return;
    }

    const button = document.createElement('button');
    button.id = 'imprimirTableFeriados';
    button.className = 'fe-pulse bg-botao-acao hover:brightness-110 text-white font-bold w-full mt-2.5 py-2.5 px-4 rounded-md transition-colors cursor-pointer border-0';
    button.type = 'button';
    button.textContent = 'IMPRIMIR OU SALVAR TABELA';
    tabela.insertAdjacentElement('afterend', button);

    button.addEventListener('click', function () {
        const titulo = document.querySelector('#feriados')?.previousElementSibling?.textContent || 'Feriados';
        const w = window.open();
        if (!w) return;

        w.document.write(`<html><head><title>${titulo}</title>`);
        w.document.write('<style>body{-webkit-print-color-adjust:exact}@page{size:landscape}.tabela-customizada.feriados{border-collapse:collapse;margin:15px 0;font-family:sans-serif;width:100%}.tabela-customizada tbody tr{border-bottom:1px solid #ddd}.tabela-customizada tbody tr td.th{background:#005c82;color:#fff;text-transform:uppercase}.tabela-customizada td{padding:5px 15px}</style>');
        w.document.write('</head><body>');
        const t = document.getElementsByClassName('tabela-customizada feriados')[0].innerHTML;
        w.document.write('<table class="tabela-customizada feriados">' + t.replace(/<\/?[a][a-z0-9]*[^<>]*>|<!--.*?-->/g, '') + '</table>');
        w.document.write('</body></html>');
        w.document.close();
        w.print();
    });
}

function inicializarBotoesDescricao() {
    document.addEventListener('click', function (event) {
        const target = event.target;
        if (!target.classList.contains('botaoDescricao')) return;

        const parent = target.parentElement;

        if (target.classList.contains('aberto')) {
            target.classList.remove('aberto');
            target.classList.add('fechado');
            target.textContent = 'ver';
            const desc = parent.querySelector('.descricao');
            if (desc) parent.removeChild(desc);
        } else {
            target.classList.remove('fechado');
            target.classList.add('aberto');
            target.textContent = 'ocultar';

            const div = document.createElement('div');
            div.className = 'descricao';
            div.style.marginTop = '10px';
            div.innerHTML = '<span>' + target.dataset.descricao + '</span>';
            parent.appendChild(div);
        }
    });
}

function renderLinhaEstados(ano, item, colunasAtivas) {
    let cells = '';
    colunasAtivas.forEach(col => {
        if (col.key === 'estado') {
            cells += `<td class="px-3 py-2">${escapeHtml(item.estado)}</td>`;
        } else if (col.key === 'uf') {
            cells += `<td class="px-3 py-2 font-mono text-xs">${escapeHtml(item.uf)}</td>`;
        } else if (col.key === 'acao') {
            cells += `<td class="px-3 py-2"><a href="/${ano}/${item.slug}/" class="inline-block px-3 py-1.5 rounded-md bg-botao-acao text-white text-xs font-semibold hover:brightness-110 transition">Ver feriados</a></td>`;
        }
    });
    return `<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">${cells}</tr>`;
}

function renderLinhaMeses(ano, item, colunasAtivas) {
    let cells = '';
    colunasAtivas.forEach(col => {
        if (col.key === 'mes') {
            cells += `<td class="px-3 py-2">${escapeHtml(item.mes)}</td>`;
        } else if (col.key === 'acao') {
            cells += `<td class="px-3 py-2"><a href="/${ano}/${item.slug}/" class="inline-block px-3 py-1.5 rounded-md bg-botao-acao text-white text-xs font-semibold hover:brightness-110 transition">Ver feriados</a></td>`;
        }
    });
    return `<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">${cells}</tr>`;
}

function renderLinhaCidades(ano, uf, item, colunasAtivas) {
    let cells = '';
    colunasAtivas.forEach(col => {
        if (col.key === 'cidade') {
            cells += `<td class="px-3 py-2">${escapeHtml(item.cidade)}</td>`;
        } else if (col.key === 'acao') {
            cells += `<td class="px-3 py-2"><a href="/${ano}/${uf}/${item.slug}/" class="inline-block px-3 py-1.5 rounded-md bg-botao-acao text-white text-xs font-semibold hover:brightness-110 transition">Ver feriados</a></td>`;
        }
    });
    return `<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">${cells}</tr>`;
}

function inicializarTabelaEstados() {
    const container = document.getElementById('tabelaEstadosContainer');
    if (!container) return;

    const scriptEl = document.getElementById('dados-tabela-estados');
    if (!scriptEl) return;

    let dados = [];
    try {
        const decoded = decodeData(scriptEl.textContent.trim());
        if (decoded) dados = decoded;
    } catch (_) {}

    if (!dados.length) return;

    const h1 = document.querySelector('h1');
    const ano = h1?.dataset.ano || new Date().getFullYear();

    new TabelaGenerica({
        dados,
        containerId: 'tabelaEstadosContainer',
        colunas: [
            { key: 'estado', label: 'Estado' },
            { key: 'uf',     label: 'UF',    width: '80px' },
            { key: 'acao',   label: 'Ação',  width: '150px' }
        ],
        hideOnMobile: ['uf'],
        chaveBusca: 'estado',
        labelBusca: 'Buscar estado',
        renderLinha: (item, cols) => renderLinhaEstados(ano, item, cols)
    }).renderizar();
}

function inicializarTabelaMeses() {
    const container = document.getElementById('tabelaMesesContainer');
    if (!container) return;

    const scriptEl = document.getElementById('dados-tabela-meses');
    if (!scriptEl) return;

    let dados = [];
    try {
        const decoded = decodeData(scriptEl.textContent.trim());
        if (decoded) dados = decoded;
    } catch (_) {}

    if (!dados.length) return;

    const h1 = document.querySelector('h1');
    const ano = h1?.dataset.ano || new Date().getFullYear();

    new TabelaGenerica({
        dados,
        containerId: 'tabelaMesesContainer',
        colunas: [
            { key: 'mes',  label: 'Mês' },
            { key: 'acao', label: 'Ação', width: '150px' }
        ],
        chaveBusca: 'mes',
        labelBusca: 'Buscar mês',
        renderLinha: (item, cols) => renderLinhaMeses(ano, item, cols)
    }).renderizar();
}

function inicializarTabelaCidades() {
    const container = document.getElementById('tabelaCidadesContainer');
    if (!container) return;

    const scriptEl = document.getElementById('dados-tabela-cidades');
    if (!scriptEl) return;

    let dados = [];
    try {
        const decoded = decodeData(scriptEl.textContent.trim());
        if (decoded) dados = decoded;
    } catch (_) {}

    if (!dados.length) return;

    const h1 = document.querySelector('h1');
    const ano = h1?.dataset.ano || new Date().getFullYear();
    const uf  = h1?.dataset.uf;

    new TabelaGenerica({
        dados,
        containerId: 'tabelaCidadesContainer',
        colunas: [
            { key: 'cidade', label: 'Cidade' },
            { key: 'acao',   label: 'Ação', width: '150px' }
        ],
        chaveBusca: 'cidade',
        labelBusca: 'Buscar cidade',
        renderLinha: (item, cols) => renderLinhaCidades(ano, uf, item, cols)
    }).renderizar();
}

async function inicializarAnuncios() {
    if (!config.possui_adsterra) return;
    try {
        const { injetarAnuncios } = await import('./anuncios-adsterra.js');
        injetarAnuncios();
    } catch (e) {
        console.warn('Erro ao carregar módulo de anúncios:', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    inicializarCarregamentoImagens();
    inicializarFormularioContato();
    inicializarAnalyticsPortal();
    inicializarFlowbite();
    inicializarMenuMobile();
    inicializarMenuDesktop();

    inicializarCalendario();
    inicializarTabelaFeriados();
    inicializarBotoesDescricao();
    inicializarAnaliseFeriados();

    inicializarTabelaEstados();
    inicializarTabelaMeses();
    inicializarTabelaCidades();

    if (document.querySelector('[data-barra-feriados]')) {
        inicializarBarraFeriados();
    }

    await inicializarAnuncios();
});