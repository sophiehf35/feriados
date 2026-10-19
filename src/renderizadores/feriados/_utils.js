// src/renderizadores/feriados/_utils.js

import { escapeHtml, capitalizar, slugify, encodeData } from '../../js/utils.js';

export function organizaFeriados(ano, dadosArray) {
    const dados = (dadosArray || []).map(f => String(f).trim()).filter(Boolean);
    const feriados = {};

    dados.forEach(feriado => {
        const partes = feriado.split('||').map(p => p.trim());
        if (partes.length < 4) return;

        const data = partes[0].split('/').reverse().join('-');
        const nome = partes[1];
        const ambito = partes[2];
        const tipo = partes[3];
        const descricao = partes.length > 4 ? partes.slice(4).join('-').trim() : '';

        let classe = '';
        let tipoNome = '';

        if (tipo === 'facultativo') {
            classe = 'bg-ponto-facultativo';
            tipoNome = 'Ponto Facultativo';
        } else if (tipo === 'feriado' && ambito === 'municipal') {
            classe = 'bg-feriado-municipal';
            tipoNome = 'Feriado Municipal';
        } else if (tipo === 'feriado' && ambito === 'estadual') {
            classe = 'bg-feriado-estadual';
            tipoNome = 'Feriado Estadual';
        } else if (tipo === 'feriado' && ambito === 'nacional') {
            classe = 'bg-feriado-nacional';
            tipoNome = 'Feriado Nacional';
        }

        feriados[`${ano}-${data}`] = { classe, tipo: tipoNome, nome, descricao };
    });

    return feriados;
}

export function converterData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatarDataTabela(data) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const [, mes, dia] = data.split('-');
    return `${dia} de ${meses[parseInt(mes, 10) - 1]}`;
}

export function proximaDataComemorativa(feriados, tipo = '') {
    const hoje = new Date().toISOString().slice(0, 10);
    const futuros = Object.keys(feriados).filter(d => d > hoje).sort();
    const proximo = tipo ? futuros.find(d => feriados[d].tipo === tipo) : futuros[0];
    if (proximo) {
        return { existe: true, descricao: `${feriados[proximo].nome} no dia ${converterData(proximo)}` };
    }
    return { existe: false, descricao: '' };
}

export function filtrarFeriados(feriados, tipo) {
    const lista = Object.keys(feriados).filter(d => !tipo || feriados[d].tipo === tipo);
    const descricao = lista.map(d => `${feriados[d].nome} no dia ${converterData(d)}`).join(', ');
    return { numero: lista.length, descricao };
}

export function gerarTabelaFeriados(feriados) {
    const ordem = Object.keys(feriados).sort();
    let html = '<table id="feriados" class="tabela-customizada feriados"><tbody>';
    for (const data of ordem) {
        const f = feriados[data];
        html += `<tr><td class="th">${formatarDataTabela(data)}</td><td>${f.tipo} (${f.nome})</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
}

export function renderBarra(barra, { anoAtual, ufAtual, cidadeAtual } = {}) {
    const anos = barra?.anos || [];
    const estados = barra?.estados || [];

    const cidadesRaw = barra?.cidades;
    let cidades = [];
    let cidadesJson = '[]';

    if (Array.isArray(cidadesRaw)) {
        cidades = cidadesRaw;
        cidadesJson = JSON.stringify(cidadesRaw);
    } else if (cidadesRaw && typeof cidadesRaw === 'object') {
        cidadesJson = JSON.stringify(cidadesRaw);
        if (ufAtual && Array.isArray(cidadesRaw[ufAtual])) {
            cidades = cidadesRaw[ufAtual];
        }
    }

    const opcoesAno = anos.map(a =>
        `<option value="${a}" ${String(a) === String(anoAtual) ? 'selected' : ''}>${a}</option>`
    ).join('');

    const opcoesEstado = estados.map(e =>
        `<option value="${e.uf}" ${e.uf === ufAtual ? 'selected' : ''}>${escapeHtml(capitalizar(e.estado))}</option>`
    ).join('');

    const opcoesCidade = cidades.map(c =>
        `<option value="${c.slug}" ${c.slug === cidadeAtual ? 'selected' : ''}>${escapeHtml(capitalizar(c.cidade))}</option>`
    ).join('');

    return `
    <div class="filtro-estados-cidades bg-primary py-4 w-full">
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto">
            <form action="#" method="post" novalidate data-barra-feriados>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-y-2 md:gap-0">
                    <div>
                        <select name="ano" id="cmbAno" class="select ano w-full bg-white text-gray-800 border border-gray-300 px-4 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                            <option value="">Selecione o Ano</option>
                            ${opcoesAno}
                        </select>
                    </div>
                    <div>
                        <select name="estado" id="cmbEstado" class="select estado w-full bg-white text-gray-800 border border-gray-300 px-4 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                            <option value="">Selecione o Estado</option>
                            ${opcoesEstado}
                        </select>
                    </div>
                    <div>
                        <select name="cidade" id="cmbCidade" class="select cidade w-full bg-white text-gray-800 border border-gray-300 px-4 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                            <option value="">Selecione a Cidade</option>
                            ${opcoesCidade}
                        </select>
                    </div>
                    <div>
                        <button type="button" id="botaoBuscar" class="btn-buscar w-full bg-botao-acao hover:brightness-110 text-white font-bold px-4 text-base md:text-lg transition-colors cursor-pointer border-0">
                            ACESSAR
                        </button>
                    </div>
                </div>
                <script type="application/json" id="dados-barra-cidades">${cidadesJson}</script>
            </form>
        </div>
    </div>`;
}

export function renderCalendarioHtml() {
    return `<div id="calendario-de-feriados"></div>`;
}

export function renderLegendaHtml(tipos) {
    const map = {
        nacional:    ['bg-feriado-nacional',  'Feriado Nacional'],
        estadual:    ['bg-feriado-estadual',  'Feriado Estadual'],
        municipal:   ['bg-feriado-municipal', 'Feriado Municipal'],
        facultativo: ['bg-ponto-facultativo', 'Ponto Facultativo'],
    };

    const itens = (tipos || [])
        .filter(t => map[t])
        .map(t => `
            <div class="legend-item flex items-center gap-2 text-sm">
                <span class="color-box ${map[t][0]} w-4 h-4 rounded inline-block"></span>
                <span>${map[t][1]}</span>
            </div>`)
        .join('');

    return `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">LEGENDA</h3>
        </div>
        <div class="px-5 py-4">
            <div class="legend-grid flex flex-wrap gap-x-8 gap-y-3">
                ${itens}
            </div>
        </div>
    </div>`;
}

export function renderSumarioHtml(itens) {
    if (!itens || itens.length === 0) return '';

    const setaGrande = `<svg class="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
    const pontoPequeno = `<svg class="w-3 h-3 text-primary/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="10" cy="10" r="3"></circle></svg>`;

    const itensHtml = itens.map(item => {
        const sub = (item.itens && item.itens.length)
            ? `<ul class="mt-2 space-y-1.5 pl-6 border-l-2 border-primary/20">
                ${item.itens.map(s => `
                    <li>
                        <a href="${s.href}" class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-200 group">
                            ${pontoPequeno}
                            <span>${escapeHtml(s.titulo)}</span>
                        </a>
                    </li>`).join('')}
               </ul>`
            : '';

        return `
        <li>
            <a href="${item.href}" class="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors duration-200 group">
                ${setaGrande}
                <span>${escapeHtml(item.titulo)}</span>
            </a>
            ${sub}
        </li>`;
    }).join('');

    return `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">SUMÁRIO</h3>
        </div>
        <div class="p-4">
            <ul class="space-y-3 text-sm">
                ${itensHtml}
            </ul>
        </div>
    </div>`;
}

export function renderFaqHtml(faqQuestions) {
    return (faqQuestions || []).map(faq => {
        const perguntaSlug = slugify(faq.pergunta);
        return `
        <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 id="${perguntaSlug}" style="margin: 10px 0px; font-size:18px; padding-left: 0px;" itemprop="name">${escapeHtml(faq.pergunta)}</h3>
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                <div style="text-align:justify" itemprop="text"><p>${faq.resposta}</p></div>
            </div>
        </div>`;
    }).join('');
}

export function renderLinksUteisHtml() {
    return `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">LINKS ÚTEIS</h3>
        </div>
        <div class="p-4">
            <ul class="space-y-1 text-sm">
                <li><a href="https://buscacepcorreios.com.br/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Busca CEP</a></li>
            </ul>
        </div>
    </div>`;
}

export function renderScriptsFeriados(feriados) {
    return `<script>window.__FERIADOS__ = ${JSON.stringify(feriados)};</script>`;
}

// ============================================================
// Helpers para as novas tabelas (estados / meses / cidades)
// ============================================================

export function parseConcatenado(str, chaves) {
    return (str || '')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            const partes = s.split('||').map(p => p.trim());
            const obj = {};
            chaves.forEach((k, i) => { obj[k] = partes[i] || ''; });
            return obj;
        });
}

export const MESES = [
    { slug: 'janeiro',   nome: 'Janeiro'   },
    { slug: 'fevereiro', nome: 'Fevereiro' },
    { slug: 'marco',     nome: 'Março'     },
    { slug: 'abril',     nome: 'Abril'     },
    { slug: 'maio',      nome: 'Maio'      },
    { slug: 'junho',     nome: 'Junho'     },
    { slug: 'julho',     nome: 'Julho'     },
    { slug: 'agosto',    nome: 'Agosto'    },
    { slug: 'setembro',  nome: 'Setembro'  },
    { slug: 'outubro',   nome: 'Outubro'   },
    { slug: 'novembro',  nome: 'Novembro'  },
    { slug: 'dezembro',  nome: 'Dezembro'  },
];

export function renderTabelaEstados(estadosConcatenados, ano) {
    const estados = parseConcatenado(estadosConcatenados, ['uf', 'estado']);
    if (!estados.length) return '';

    const dados = estados.map(e => ({
        estado: capitalizar(e.estado),
        uf: e.uf.toUpperCase(),
        slug: e.uf.toLowerCase(),
    }));
    const dadosCodificados = encodeData(dados);

    return `
    <div id="estados" class="bg-white rounded-md border border-gray-200 p-4">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 class="text-lg md:text-xl font-semibold">Feriados por Estado em ${ano}</h2>
        </div>
        <div id="tabelaEstadosContainer"></div>
    </div>
    <script id="dados-tabela-estados" type="application/json">${dadosCodificados}</script>`;
}

export function renderTabelaMeses(ano) {
    const dados = MESES.map(m => ({
        mes: m.nome,
        slug: m.slug,
    }));
    const dadosCodificados = encodeData(dados);

    return `
    <div id="meses" class="bg-white rounded-md border border-gray-200 p-4">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 class="text-lg md:text-xl font-semibold">Feriados por Mês em ${ano}</h2>
        </div>
        <div id="tabelaMesesContainer"></div>
    </div>
    <script id="dados-tabela-meses" type="application/json">${dadosCodificados}</script>`;
}

export function renderTabelaCidades(cidadesConcatenadas, ano, uf) {
    const cidades = parseConcatenado(cidadesConcatenadas, ['slug', 'cidade']);
    if (!cidades.length) return '';

    const dados = cidades.map(c => ({
        cidade: capitalizar(c.cidade),
        slug: c.slug,
    }));
    const dadosCodificados = encodeData(dados);

    return `
    <div id="cidades" class="bg-white rounded-md border border-gray-200 p-4">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <h2 class="text-lg md:text-xl font-semibold">Feriados por Cidade — ${escapeHtml(uf.toUpperCase())}</h2>
        </div>
        <div id="tabelaCidadesContainer"></div>
    </div>
    <script id="dados-tabela-cidades" type="application/json">${dadosCodificados}</script>`;
}

// ============================================================
// ANÁLISE DE ANO — helpers pra /ano/
// Todos puros (calculados dos dados existentes) → zero RPC extra
// ============================================================

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
        if (data.getDay() === 0 || data.getDay() === 6) count++;
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

        if (dow === 0 || dow === 6) fds++;
        else {
            feriadosUteis++;
            if (dow === 1 || dow === 5) emendas++;
            else if (dow === 2 || dow === 4) emendas++;
        }

        // Próximo feriado (só Nacional, hoje ou futuro)
        if (!proximo && data >= hoje && f.tipo === 'Feriado Nacional') {
            const diasFaltando = Math.round((data - hoje) / 86400000);
            proximo = {
                nome: f.nome,
                data: dataISO.split('-').reverse().join('/'),
                diasFaltando,
                tipo: f.tipo,
            };
        }

        // Feriadões (só Nacionais com potencial >= 3 dias)
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
                    dow,
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

export function renderProximoFeriadoHtml(proximo, ano) {
    if (!proximo) {
        return `
        <div class="bg-white shadow-md rounded-md p-4 mb-6 border-l-4 border-gray-300">
            <p class="text-gray-600 text-sm"><b>Ano passado.</b> Os feriados de ${ano} já aconteceram. Confira os <a href="/${Number(ano) + 1}/" class="text-primary hover:underline font-medium">feriados ${Number(ano) + 1}</a> para planejar o próximo ano.</p>
        </div>`;
    }

    const { nome, data, diasFaltando } = proximo;
    const quando = diasFaltando === 0 ? 'hoje' :
                   diasFaltando === 1 ? 'amanhã' :
                   `daqui a ${diasFaltando} dias`;

    // Ícone interno: SVG (check) quando é hoje, número quando falta
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

export function renderNumerosHtml(analise, ano) {
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

export function renderFeriadoesHtml(feriadoes, ano) {
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

export function renderComparacaoHtml(comparacao, ano) {
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

export function renderNavegacaoAnosHtml(ano, anos) {
    const lista = anos || [];
    const idx = lista.indexOf(String(ano));
    if (idx === -1) return '';

    const anterior = idx + 1 < lista.length ? lista[idx + 1] : null;
    const proximo  = idx - 1 >= 0 ? lista[idx - 1] : null;

    const botaoBase = 'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition';

    const botaoAnterior = anterior
        ? `<a href="/${anterior}/" class="${botaoBase} text-white bg-white/10 hover:bg-white/20">← ${anterior}</a>`
        : `<span class="${botaoBase} text-white/40 cursor-not-allowed">← —</span>`;

    const botaoProximo = proximo
        ? `<a href="/${proximo}/" class="${botaoBase} text-white bg-white/10 hover:bg-white/20">${proximo} →</a>`
        : `<span class="${botaoBase} text-white/40 cursor-not-allowed">— →</span>`;

    return `
    <div class="flex items-center justify-center gap-3 mt-3">
        ${botaoAnterior}
        <span class="text-white/60 text-xs uppercase tracking-wider">${ano}</span>
        ${botaoProximo}
    </div>`;
}