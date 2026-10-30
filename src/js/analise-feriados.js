// src/js/analise-feriados.js

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

export function calcularAnalise(feriados, ano) {
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

        if (!proximo && data >= hoje && f.tipo && f.tipo.startsWith('Feriado')) {
            const diasFaltando = Math.round((data - hoje) / 86400000);
            proximo = {
                nome: f.nome,
                data: dataISO.split('-').reverse().join('/'),
                diasFaltando,
                tipo: f.tipo,
            };
        }

        if (f.tipo && f.tipo.startsWith('Feriado') && dow !== 0 && dow !== 6) {
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

// ────────────────────────────────────────────────────────────
// Próximo feriado — o texto muda conforme o contexto
// ────────────────────────────────────────────────────────────
function _labelProximo(contexto, label) {
    if (contexto === 'estado') return `Próximo feriado no ${label}`;
    if (contexto === 'cidade') return `Próximo feriado em ${label}`;
    if (contexto === 'mes')    return `Próximo feriado em ${label}`;
    return 'Próximo feriado nacional';
}

function renderProximoFeriadoHtml(proximo, ano, contexto, label) {
    const labelProximo = _labelProximo(contexto, label);

    if (!proximo) {
        const labelVazio = contexto === 'mes' ? 'Mês passado' : 'Ano passado';
        return `
        <div class="bg-white shadow-md rounded-md p-4 mb-6 border-l-4 border-gray-300">
            <p class="text-gray-600 text-sm">
                <b>${labelVazio}.</b> Os feriados de ${ano} já aconteceram.
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
                <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold">${labelProximo}</p>
                <p class="text-lg font-bold text-gray-800 mt-0.5">${escapeHtml(nome)}</p>
                <p class="text-sm text-gray-600">${data} — <b>${quando}</b></p>
            </div>
        </div>
    </div>`;
}

// ────────────────────────────────────────────────────────────
// Números — 4 linhas (ano/estado/cidade) ou 3 (mês)
// ────────────────────────────────────────────────────────────
function renderNumerosHtml(analise, contexto) {
    const linhas = [];

    linhas.push({
        label: contexto === 'mes' ? 'Feriados no mês' : 'Feriados no ano',
        valor: analise.total,
    });

    if (contexto !== 'mes') {
        linhas.push({ label: 'Dias úteis', valor: analise.diasUteis });
    }

    linhas.push({
        label: contexto === 'mes' ? 'Emendas no mês' : 'Emendas naturais',
        valor: analise.emendas,
    });

    linhas.push({
        label: contexto === 'mes' ? 'Fins de semana no mês' : 'Em fins de semana',
        valor: analise.fds,
    });

    return `
    <ul class="divide-y divide-gray-200">
        ${linhas.map(l => `
            <li class="flex items-center justify-between py-2.5">
                <span class="text-sm text-gray-600">${l.label}</span>
                <span class="text-lg font-bold text-primary">${l.valor}</span>
            </li>
        `).join('')}
    </ul>`;
}

// ────────────────────────────────────────────────────────────
// Feriadões
// ────────────────────────────────────────────────────────────
function renderFeriadoesHtml(feriadoes, contexto) {
    if (!feriadoes.length) {
        const msg = contexto === 'mes'
            ? 'Nenhum feriadão identificado neste mês.'
            : 'Nenhum feriadão identificado para este ano.';
        return `<p class="text-sm text-gray-600">${msg}</p>`;
    }

    const itens = feriadoes.map(f => `
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

    return `<div class="space-y-2">${itens}</div>`;
}

// ────────────────────────────────────────────────────────────
// Comparação
// ────────────────────────────────────────────────────────────
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

export function inicializarAnaliseFeriados() {
    const feriados = window.__FERIADOS__ || {};
    const meta     = window.__FERIADOS_ANO__ || {};

    const ano        = Number(meta.ano) || new Date().getFullYear();
    const contexto   = meta.contexto || 'ano';
    const label      = meta.label || '';
    const comparacao = meta.comparacao || null;

    if (Object.keys(feriados).length === 0) return;

    const analise = calcularAnalise(feriados, ano);

    const elProximo    = document.getElementById('proximo-feriado-container');
    const elNumeros    = document.getElementById('numeros-container');
    const elFeriadoes  = document.getElementById('feriadoes-container');
    const elComparacao = document.getElementById('comparacao-container');

    if (elProximo) {
        elProximo.innerHTML = renderProximoFeriadoHtml(analise.proximo, ano, contexto, label);
    }

    if (elNumeros) {
        elNumeros.innerHTML = renderNumerosHtml(analise, contexto);
    }

    if (elFeriadoes) {
        elFeriadoes.innerHTML = renderFeriadoesHtml(analise.feriadoes, contexto);
    }

    if (elComparacao) {
        const html = renderComparacaoHtml(comparacao, ano);
        elComparacao.innerHTML = html;
        if (!html) elComparacao.style.display = 'none';
    }
}