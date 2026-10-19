// src/js/analise-ano.js

import { escapeHtml } from './utils.js';

function _ehBissexto(ano) {
    const a = Number(ano);
    return (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
}

function _diasNoAno(ano) {
    return _ehBissexto(ano) ? 366 : 365;
}

function _contarFinsDeSemana(ano) {
    let count = 0;
    const dias = _diasNoAno(ano);
    for (let d = 0; d < dias; d++) {
        const data = new Date(Number(ano), 0, 1 + d);
        const dow = data.getDay();
        if (dow === 0 || dow === 6) count++;
    }
    return count;
}

export function calcularAnaliseAno(feriados, ano) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const entradas = Object.entries(feriados || {});
    const total = entradas.length;

    let fds = 0, emendas = 0, feriadosUteis = 0;
    const feriadoes = [];
    let proximo = null;

    for (const [dataISO, f] of entradas) {
        const data = new Date(dataISO + 'T00:00:00');
        const dow = data.getDay();

        if (dow === 0 || dow === 6) {
            fds++;
        } else {
            feriadosUteis++;
            if (dow === 1 || dow === 5 || dow === 2 || dow === 4) emendas++;
        }

        if (!proximo && data >= hoje && f.tipo === 'Feriado Nacional') {
            const diasFaltando = Math.round((data - hoje) / 86400000);
            proximo = {
                nome: f.nome,
                data: dataISO.split('-').reverse().join('/'),
                diasFaltando,
                tipo: f.tipo,
            };
        }

        if (f.tipo === 'Feriado Nacional' && dow !== 0 && dow !== 6) {
            let dias = 1;
            if (dow === 1 || dow === 5) dias = 3;
            else if (dow === 2 || dow === 4) dias = 4;
            if (f.nome.toLowerCase().includes('carnaval')) dias = 5;

            if (dias >= 3) {
                feriadoes.push({
                    nome: f.nome,
                    data: dataISO.split('-').reverse().join('/'),
                    dias,
                });
            }
        }
    }

    const diasFds = _contarFinsDeSemana(ano);
    const diasUteis = _diasNoAno(ano) - diasFds - feriadosUteis;

    const seen = new Set();
    const feriadoesUnicos = feriadoes.filter(f => {
        const key = f.nome.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    feriadoesUnicos.sort((a, b) => b.dias - a.dias || a.data.localeCompare(b.data));

    return {
        total,
        fds,
        emendas,
        diasUteis,
        proximo,
        feriadoes: feriadoesUnicos.slice(0, 3),
    };
}

function renderProximoFeriadoHtml(proximo, ano) {
    if (!proximo) {
        return `
        <div class="bg-white shadow-md rounded-md p-4 mb-6 border-l-4 border-gray-300">
            <p class="text-gray-600 text-sm">
                <b>Ano passado.</b> Os feriados de ${ano} já aconteceram.
                Confira os <a href="/${Number(ano) + 1}/" class="text-primary hover:underline font-medium">feriados ${Number(ano) + 1}</a>
                para planejar o próximo ano.
            </p>
        </div>`;
    }

    const { nome, data, diasFaltando } = proximo;
    const quando = diasFaltando === 0 ? 'hoje' :
                   diasFaltando === 1 ? 'amanhã' :
                   `daqui a ${diasFaltando} dias`;

    const iconeInterno = diasFaltando === 0
        ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
           </svg>`
        : `<span class="text-lg font-bold leading-none">${diasFaltando}</span>`;

    return `
    <div class="bg-white shadow-md rounded-md p-4 mb-6 border-l-4 border-primary">
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center" aria-hidden="true">
                ${iconeInterno}
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold">Próximo feriado nacional</p>
                <p class="text-lg font-bold text-gray-800 mt-0.5">${escapeHtml(nome)}</p>
                <p class="text-sm text-gray-600">${data} — <b>${quando}</b></p>
            </div>
        </div>
    </div>`;
}

function renderNumerosHtml(analise, ano) {
    return `
    <div class="bg-white shadow-md rounded-md p-4 mb-6">
        <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Calendário ${ano} em números</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
                <p class="text-3xl font-bold text-primary">${analise.total}</p>
                <p class="text-xs text-gray-600 uppercase tracking-wider mt-1">Feriados no ano</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-primary">${analise.diasUteis}</p>
                <p class="text-xs text-gray-600 uppercase tracking-wider mt-1">Dias úteis</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-primary">${analise.emendas}</p>
                <p class="text-xs text-gray-600 uppercase tracking-wider mt-1">Emendas naturais</p>
            </div>
            <div class="text-center">
                <p class="text-3xl font-bold text-primary">${analise.fds}</p>
                <p class="text-xs text-gray-600 uppercase tracking-wider mt-1">Em fins de semana</p>
            </div>
        </div>
    </div>`;
}

function renderFeriadoesHtml(feriadoes, ano) {
    if (!feriadoes.length) return '';

    const cards = feriadoes.map(f => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:border-primary transition">
            <div class="min-w-0">
                <p class="font-semibold text-gray-800 truncate">${escapeHtml(f.nome)}</p>
                <p class="text-sm text-gray-600">${f.data}</p>
            </div>
            <div class="flex-shrink-0 ml-3">
                <span class="inline-flex items-center rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold">
                    ${f.dias} dias
                </span>
            </div>
        </div>
    `).join('');

    return `
    <div class="bg-white shadow-md rounded-md p-4 mb-6">
        <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-1">Melhores feriadões ${ano}</h2>
        <p class="text-sm text-gray-600 mb-4">Feriados que caem em segundas ou sextas geram 3 dias de folga. Em terças ou quintas, até 4 dias com 1 dia de emenda.</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${cards}
        </div>
    </div>`;
}

function renderComparacaoHtml(comparacao, ano) {
    if (!comparacao || !comparacao.existe) return '';

    const delta = comparacao.delta;
    const deltaTexto = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : 'mesma quantidade';
    const seta = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    const cor = delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-600';

    return `
    <div class="bg-white shadow-md rounded-md p-4 mb-6">
        <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-2">${ano} vs ${comparacao.ano_anterior}</h2>
        <p class="text-gray-700 text-justify">
            <b>${ano}</b> tem <b>${comparacao.total_atual}</b> feriados nacionais contra
            <b>${comparacao.total_anterior}</b> em <b>${comparacao.ano_anterior}</b>
            — <span class="${cor} font-semibold">${seta} ${deltaTexto}</span>.
            A diferença vem das datas móveis (Páscoa, Carnaval e Corpus Christi), que mudam de posição a cada ano,
            e de feriados que caem em fins de semana em um ano mas não no outro.
        </p>
    </div>`;
}

export function inicializarAnaliseAno() {
    const feriados = window.__FERIADOS__ || {};
    const meta     = window.__FERIADOS_ANO__ || {};

    const ano     = Number(meta.ano) || new Date().getFullYear();
    const comparacao = meta.comparacao || null;

    if (Object.keys(feriados).length === 0) return;

    const analise = calcularAnaliseAno(feriados, ano);

    const elProximo   = document.getElementById('proximo-feriado-container');
    const elNumeros   = document.getElementById('numeros-container');
    const elFeriadoes = document.getElementById('feriadoes-container');
    const elComparacao = document.getElementById('comparacao-container');

    if (elProximo)    elProximo.innerHTML    = renderProximoFeriadoHtml(analise.proximo, ano);
    if (elNumeros)    elNumeros.innerHTML    = renderNumerosHtml(analise, ano);
    if (elFeriadoes)  elFeriadoes.innerHTML  = renderFeriadoesHtml(analise.feriadoes, ano);
    if (elComparacao) elComparacao.innerHTML = renderComparacaoHtml(comparacao, ano);
}