// src/renderizadores/feriados/ano.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml } from '../../js/utils.js';
import {
    organizaFeriados,
    gerarTabelaFeriados,
    proximaDataComemorativa,
    converterData,
    renderBarra,
    renderCalendarioHtml,
    renderLegendaHtml,
    renderSumarioHtml,
    renderFaqHtml,
    renderLinksUteisHtml,
    renderScriptsFeriados,
    renderTabelaEstados,
    renderTabelaMeses,
} from './_utils.js';
import {
    renderizarAvaliacoes,
    renderFormularioComentario,
    renderScriptsTurnstile,
} from './_avaliacoes.js';

export function render(config, data, contexto = {}) {
    const { scriptsAdicionais = '' } = contexto;

    const ano = String(data.ano);

    const titulo    = data.meta_titulo_google    || `Feriados ${ano}`;
    const descricao = data.meta_descricao_google || '';
    const imagem    = `${config.url_cdn_imagens}/feriados/${ano}.webp`;

    const feriados = organizaFeriados(ano, (data.feriados_concatenados || '').split(';'));
    const tabelaFeriados = gerarTabelaFeriados(feriados);

    const proximoFeriado      = proximaDataComemorativa(feriados, 'Feriado Nacional');
    const proximoFacultativo  = proximaDataComemorativa(feriados, 'Ponto Facultativo');

    const diasCarnaval   = Object.keys(feriados).filter(d => feriados[d].nome.includes('Carnaval'));
    const sextaSanta     = Object.keys(feriados).filter(d => feriados[d].nome.includes('Sexta-feira Santa'));
    const corpusChristi  = Object.keys(feriados).filter(d => feriados[d].nome.includes('Corpus Christi'));

    const faqQuestions = [
        {
            pergunta: `Qual o próximo feriado nacional ${ano}?`,
            resposta: proximoFeriado.existe
                ? `O próximo feriado nacional de ${ano} é ${proximoFeriado.descricao}.`
                : `Não existe próximo feriado em ${ano} pois o ano já terminou.`
        },
        {
            pergunta: `Qual o próximo ponto facultativo ${ano}?`,
            resposta: proximoFacultativo.existe
                ? `O próximo ponto facultativo de ${ano} é ${proximoFacultativo.descricao}.`
                : `Não existe próximo ponto facultativo em ${ano} pois o ano já terminou.`
        },
        {
            pergunta: `Que dia é o carnaval ${ano}?`,
            resposta: diasCarnaval.length >= 2
                ? `O carnaval de ${ano} ocorrerá nos dias ${converterData(diasCarnaval[0])} e ${converterData(diasCarnaval[1])}.`
                : '—'
        },
        {
            pergunta: `Que dia é o feriado de sexta feira santa ${ano}?`,
            resposta: sextaSanta[0]
                ? `O feriado de Sexta-feira Santa de ${ano} será no dia ${converterData(sextaSanta[0])}.`
                : '—'
        },
        {
            pergunta: `Que dia é o feriado de Corpus Christi ${ano}?`,
            resposta: corpusChristi[0]
                ? `O feriado de Corpus Christi de ${ano} será no dia ${converterData(corpusChristi[0])}.`
                : '—'
        },
    ];

    const sumarioHtml = renderSumarioHtml([
        { titulo: `Feriados ${ano}`, href: '#feriados' },
        { titulo: `Feriados Nacionais ${ano}`, href: '#feriados-nacionais' },
        { titulo: 'Feriados por Estado', href: '#estados' },
        { titulo: 'Feriados por Mês', href: '#meses' },
        {
            titulo: `Feriados em ${ano}`,
            href: `#faq`,
            itens: faqQuestions.map(faq => ({
                titulo: faq.pergunta,
                href: `#${faq.pergunta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
            }))
        }
    ]);

    const breadcrumbHtml = `
    <div class="bc-icons-2 mt-2">
        <ol class="flex flex-wrap items-center justify-center text-sm md:!text-base text-blue-100" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center">
                <a itemprop="item" href="/" class="text-white hover:text-blue-200"><span itemprop="name">Feriados</span></a>
                <meta itemprop="position" content="1"><span class="mx-2 text-white">›</span>
            </li>
            <li class="flex items-center" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <span itemprop="name" class="text-white font-semibold">${ano}</span>
                <meta itemprop="position" content="2">
            </li>
        </ol>
    </div>`;

    const conteudo = `
    <div class="sub_header_in bg-primary text-white py-6 w-full">
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto text-center">
            <h1 data-tipo-pagina="ano" data-id="${data.id}" data-ano="${ano}" data-uf="todos" data-cidade="todas" data-comentarios='${JSON.stringify(data.comentarios || [])}' class="text-xl md:!text-3xl font-bold text-white">
                ${escapeHtml(titulo)}
            </h1>
        </div>
        ${breadcrumbHtml}
    </div>

    ${renderBarra(data.barra, { anoAtual: ano })}

    <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">

        <div id="proximo-feriado-container"></div>

        <div class="bg-white shadow-md rounded-md p-4 mb-6">
            <p class="text-gray-700 text-justify"><b>Feriados ${ano}:</b> ${data.paragrafo1 || ''}</p>
        </div>

        <div id="calendario" class="mb-6">
            ${renderCalendarioHtml()}
        </div>

        <div class="mb-6">
            ${renderLegendaHtml(['nacional', 'facultativo'])}
        </div>

        <div id="numeros-container"></div>
        <div id="feriadoes-container"></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados ${ano}</h2>
                    <p class="text-gray-700 text-justify mb-3">${data.paragrafo2 || ''}</p>
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3 mt-4">Feriados de ${ano}</h2>
                    <p class="text-gray-700 text-justify">Abaixo é possível visualizar todos os feriados de ${ano} em forma de lista, desde os pontos facultativos até os feriados nacionais. Caso deseje é possível imprimir ou salvar a lista, basta clicar no botão.</p>
                </div>

                <div class="bg-white rounded-md border border-gray-200 p-4">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h2 class="text-lg md:text-xl font-semibold">Lista de feriados ${ano}</h2>
                    </div>
                    <div id="feriados">${tabelaFeriados}</div>
                </div>

                <div id="feriados-nacionais" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados Nacionais ${ano}</h2>
                    <p class="text-gray-700 text-justify mb-3">${data.paragrafo3 || ''}</p>
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3 mt-4">Feriados em ${ano}</h2>
                    <p class="text-gray-700 text-justify">Confira no calendário acima as datas móveis e fixas do ano, incluindo Carnaval, Páscoa, Corpus Christi, Independência, Natal e os demais feriados nacionais.</p>
                </div>

                ${renderTabelaEstados(data.estados_concatenados, ano)}
                ${renderTabelaMeses(ano)}

                <div id="comparacao-container"></div>

                <div id="faq" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-xl font-semibold text-gray-800 text-center">Feriados nacionais ${ano}</h2>
                    <p class="text-center text-gray-600 mt-1">Confira abaixo algumas perguntas e respostas sobre as datas comemorativas de ${ano}.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div itemscope itemtype="https://schema.org/FAQPage" class="md:col-span-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${renderFaqHtml(faqQuestions)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold" id="comentarios-${ano}">Avaliações da página Feriados ${ano}</h2>
                    <p class="text-gray-700 text-justify mt-2">Já consultou os feriados de ${ano}? Compartilhe sua opinião avaliando a precisão das datas e a utilidade das informações.</p>
                </div>

                ${renderizarAvaliacoes(data.comentarios || [])}

                ${renderFormularioComentario(config)}
            </div>

            <aside class="flex flex-col gap-6">
                <div class="bg-white shadow-md rounded-md overflow-hidden">
                    <img src="${imagem}" alt="Feriados ${ano}" class="w-full h-auto block" loading="lazy">
                </div>
                ${sumarioHtml}
                ${renderLinksUteisHtml()}
            </aside>
        </div>
    </div>

    ${renderScriptsFeriados(feriados, {
        ano,
        comparacao: data.comparacao || null,
    })}
    ${renderScriptsTurnstile(config)}
    `;

    const meta = gerarMetaTags(
        config,
        titulo,
        descricao,
        `${config.dominio}/${ano}/`,
        imagem
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}