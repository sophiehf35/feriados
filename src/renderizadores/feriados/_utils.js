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

export function renderBreadcrumb(itens) {
    if (!Array.isArray(itens) || !itens.length) return '';

    const ldJson = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: itens.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.nome,
            ...(item.url ? { item: item.url } : {})
        }))
    };

    const links = itens.map((item, idx) => {
        const isLast = idx === itens.length - 1;
        const el = isLast
            ? `<span class="text-gray-600 font-medium" aria-current="page">${escapeHtml(item.nome)}</span>`
            : `<a href="${item.url}" class="text-primary hover:underline">${escapeHtml(item.nome)}</a>`;
        const sep = isLast ? '' : '<span class="text-gray-400 mx-1" aria-hidden="true">›</span>';
        return `<li class="inline-flex items-center">${el}${sep}</li>`;
    }).join('');

    return `
    <nav aria-label="breadcrumb" class="bg-gray-100 border-b border-gray-200 w-full">
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-2">
            <ol class="flex flex-wrap items-center text-xs md:text-sm gap-0">
                ${links}
            </ol>
        </div>
    </nav>
    <script type="application/ld+json">${JSON.stringify(ldJson)}</script>`;
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

// ────────────────────────────────────────────────────────────
// Script tags com dados pro JS do cliente
//   window.__FERIADOS__      — objeto feriados (usado pelo calendário)
//   window.__FERIADOS_ANO__  — { ano, comparacao } (usado pelos cards JS)
// Os cards NÃO são renderizados no server — só os dados vão.
// Assim o cache de 1 ano nunca deixa dado dinâmico congelado.
// ────────────────────────────────────────────────────────────
export function renderScriptsFeriados(feriados, anoData = null) {
    let html = `<script>window.__FERIADOS__ = ${JSON.stringify(feriados)};</script>`;
    if (anoData) {
        html += `<script>window.__FERIADOS_ANO__ = ${JSON.stringify(anoData)};</script>`;
    }
    return html;
}

// Containers vazios pros cards de análise — JS preenche
export function renderContainersAnaliseHtml() {
    return `
    <div id="proximo-feriado-container"></div>
    <div id="numeros-container"></div>
    <div id="feriadoes-container"></div>
    <div id="comparacao-container"></div>`;
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