// src/renderizadores/feriados/_utils.js

import { escapeHtml, capitalizar, slugify } from '../../js/utils.js';

export function renderAnuncio(posicao) {
    return `
    <div class="anuncio-wrapper hidden flex justify-center items-center w-full" data-posicao="${posicao}">
        <div class="hidden md:flex justify-center items-center w-full" id="anuncio_${posicao}"></div>
    </div>`;
}

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
    const cidades = barra?.cidades || [];

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
                <script type="application/json" id="dados-barra-cidades">${JSON.stringify(cidades)}</script>
            </form>
        </div>
    </div>`;
}

export function renderCalendarioHtml() {
    return `
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">CALENDÁRIO</h3>
        </div>
        <div class="p-4">
            <div id="calendario-de-feriados"></div>
        </div>
    </div>`;
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
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">LEGENDA CALENDÁRIO</h3>
        </div>
        <div class="p-4">
            <div class="legend-grid grid grid-cols-1 md:grid-cols-2 gap-2">
                ${itens}
            </div>
        </div>
    </div>`;
}

export function renderSumarioHtml(itens) {
    if (!itens || itens.length === 0) return '';

    const setaGrande = `<svg class="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
    const pontoPequeno = `<svg class="w-3 h-3 text-primary/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="3"></circle></svg>`;

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
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md flex items-center gap-2">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Sumário</h3>
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
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
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