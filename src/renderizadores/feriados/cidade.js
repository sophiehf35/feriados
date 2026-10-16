// src/renderizadores/feriados/cidade.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml, capitalizar } from '../../js/utils.js';
import {
    organizaFeriados,
    gerarTabelaFeriados,
    proximaDataComemorativa,
    filtrarFeriados,
    renderBarra,
    renderCalendarioHtml,
    renderLegendaHtml,
    renderSumarioHtml,
    renderFaqHtml,
    renderLinksUteisHtml,
    renderScriptsFeriados,
} from './_utils.js';
import {
    renderizarAvaliacoes,
    renderFormularioComentario,
    renderScriptsTurnstile,
} from './_avaliacoes.js';

export function render(config, data, contexto = {}) {
    const { scriptsAdicionais = '' } = contexto;

    const ano     = String(data.ano);
    const uf      = data.uf;
    const estado  = capitalizar(data.estado);
    const cidade  = capitalizar(data.cidade);
    const slug    = data.slug;

    const titulo    = data.meta_titulo_google    || `Feriados ${cidade} ${ano}`;
    const descricao = data.meta_descricao_google || '';

    const feriados = organizaFeriados(ano, (data.feriados_concatenados || '').split(';'));
    const tabelaFeriados = gerarTabelaFeriados(feriados);

    const proximoFeriado = proximaDataComemorativa(feriados);
    const feriadosMunicipais = filtrarFeriados(feriados, 'Feriado Municipal');

    const faqQuestions = [
        {
            pergunta: `Qual o próximo feriado ${cidade} ${ano}?`,
            resposta: proximoFeriado.existe
                ? `O próximo feriado ${cidade} ${ano} é ${proximoFeriado.descricao}.`
                : `Não existe próximo feriado ${cidade} ${ano} pois o ano já terminou.`
        },
        {
            pergunta: `Quantos feriados municipais ${cidade} ${ano} existem?`,
            resposta: feriadosMunicipais.numero > 1
                ? `Existem ${feriadosMunicipais.numero} feriados municipais em ${cidade} ${ano}, sendo eles: ${feriadosMunicipais.descricao}.`
                : `Existe ${feriadosMunicipais.numero} feriado municipal em ${cidade} ${ano}, sendo ele: ${feriadosMunicipais.descricao}.`
        }
    ];

    const sumarioHtml = renderSumarioHtml([
        { titulo: 'Calendário', href: '#calendario' },
        { titulo: `Feriados ${cidade} ${ano}`, href: '#feriados' },
        {
            titulo: `Feriados em ${cidade}`,
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
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center">
                <a itemprop="item" href="/${ano}/" class="text-white hover:text-blue-200"><span itemprop="name">${ano}</span></a>
                <meta itemprop="position" content="2"><span class="mx-2 text-white">›</span>
            </li>
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center">
                <a itemprop="item" href="/${ano}/${uf}/" class="text-white hover:text-blue-200"><span itemprop="name">${estado}</span></a>
                <meta itemprop="position" content="3"><span class="mx-2 text-white">›</span>
            </li>
            <li class="flex items-center" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <span itemprop="name" class="text-white font-semibold">${cidade}</span>
                <meta itemprop="position" content="4">
            </li>
        </ol>
    </div>`;

    const conteudo = `
    <div class="sub_header_in bg-primary text-white py-6 w-full">
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto text-center">
            <h1 data-tipo-pagina="cidade" data-id="${data.id}" data-ano="${ano}" data-uf="${uf}" data-cidade="${slug}" data-comentarios='${JSON.stringify(data.comentarios || [])}' class="text-xl md:!text-3xl font-bold text-white">
                ${escapeHtml(titulo)}
            </h1>
        </div>
        ${breadcrumbHtml}
    </div>

    ${renderBarra(data.barra, { anoAtual: ano, ufAtual: uf, cidadeAtual: slug })}

    <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white shadow-md rounded-md p-4">
                    <p class="text-gray-700 text-justify"><b>Feriados ${cidade} ${ano}:</b> confira abaixo todos os feriados ${cidade} ${ano}, basta clicar no dia e visualizar os detalhes da data, caso tenha dúvidas verifique a legenda de cores do calendário de feriados ${cidade} ${uf} ${ano}.</p>
                </div>

                <div id="calendario">${renderCalendarioHtml()}</div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados ${cidade} ${ano}</h2>
                    <p class="text-gray-700 text-justify">É importante ressaltar que os feriados da cidade de ${cidade} ${ano} podem sofrer alterações a qualquer momento, isso porque as cidades possuem autonomia para criar e alterar novos feriados.</p>
                </div>

                <div class="bg-white rounded-md border border-gray-200 p-4">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h2 class="text-lg md:text-xl font-semibold">Lista de feriados ${cidade} ${ano}</h2>
                    </div>
                    <div id="feriados">${tabelaFeriados}</div>
                </div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriado ${cidade} ${ano}</h2>
                    <p class="text-gray-700 text-justify">Caso tenha alguma sugestão a respeito de algum feriado ${cidade} ${ano} fique à vontade para enviar um comentário no formulário abaixo.</p>
                </div>

                <div id="faq" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-xl font-semibold text-gray-800 text-center">Feriados em ${cidade} ${ano}</h2>
                    <p class="text-center text-gray-600 mt-1">Confira abaixo algumas perguntas e respostas sobre os feriados ${cidade} ${ano}.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div itemscope itemtype="https://schema.org/FAQPage" class="md:col-span-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${renderFaqHtml(faqQuestions)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold" id="comentarios-${ano}-${uf}-${slug}">Avaliações da página ${cidade}</h2>
                    <p class="text-gray-700 text-justify mt-2">Já consultou os feriados de ${cidade} ${ano}? Compartilhe sua experiência avaliando a precisão das datas e a utilidade das informações.</p>
                </div>

                ${renderizarAvaliacoes(data.comentarios || [])}

                ${renderFormularioComentario(config)}
            </div>

            <aside class="flex flex-col gap-6">
                ${sumarioHtml}
                ${renderLegendaHtml(['nacional', 'estadual', 'municipal', 'facultativo'])}
                ${renderLinksUteisHtml()}
            </aside>
        </div>
    </div>

    ${renderScriptsFeriados(feriados)}
    ${renderScriptsTurnstile(config)}
    `;

    const meta = gerarMetaTags(
        config,
        titulo,
        descricao,
        `${config.dominio}/${ano}/${uf}/${slug}/`,
        null
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}