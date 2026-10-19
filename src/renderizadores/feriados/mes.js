// src/renderizadores/feriados/mes.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml, capitalizar } from '../../js/utils.js';
import {
    organizaFeriados,
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

    const ano = String(data.ano);
    const mes = capitalizar(data.mes);
    const slugMes = data.slug;

    const titulo    = data.meta_titulo_google    || `Feriados ${mes} ${ano}`;
    const descricao = data.meta_descricao_google || '';

    const feriados = organizaFeriados(ano, (data.feriados_concatenados || '').split(';'));

    const feriadosMes         = filtrarFeriados(feriados, 'Feriado Nacional');
    const pontoFacultativoMes = filtrarFeriados(feriados, 'Ponto Facultativo');

    const faqQuestions = [
        {
            pergunta: `Quantos feriados ${mes} ${ano} existem?`,
            resposta: feriadosMes.numero > 1
                ? `Existem ${feriadosMes.numero} feriados em ${mes} ${ano}, sendo eles: ${feriadosMes.descricao}.`
                : `Existe ${feriadosMes.numero} feriado em ${mes} ${ano}, sendo ele: ${feriadosMes.descricao}.`
        },
        {
            pergunta: `Quantos pontos facultativos ${mes} ${ano} existem?`,
            resposta: pontoFacultativoMes.numero > 1
                ? `Existem ${pontoFacultativoMes.numero} pontos facultativos em ${mes} ${ano}, sendo eles: ${pontoFacultativoMes.descricao}.`
                : pontoFacultativoMes.numero === 1
                    ? `Existe 1 ponto facultativo em ${mes} ${ano}, sendo ele: ${pontoFacultativoMes.descricao}.`
                    : `Não há nenhum ponto facultativo em ${mes} ${ano}.`
        }
    ];

    const sumarioHtml = renderSumarioHtml([
        { titulo: `Feriados ${mes} ${ano}`, href: '#feriados' },
        {
            titulo: `Feriados em ${mes}`,
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
            <li class="flex items-center" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <span itemprop="name" class="text-white font-semibold">${mes}</span>
                <meta itemprop="position" content="3">
            </li>
        </ol>
    </div>`;

    const conteudo = `
    <div class="sub_header_in bg-primary text-white py-6 w-full">
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto text-center">
            <h1 data-tipo-pagina="mes" data-mes="${slugMes}" data-id="${data.id}" data-ano="${ano}" data-uf="todos" data-cidade="todas" data-comentarios='${JSON.stringify(data.comentarios || [])}' class="text-xl md:!text-3xl font-bold text-white">
                ${escapeHtml(titulo)}
            </h1>
        </div>
        ${breadcrumbHtml}
    </div>

    ${renderBarra(data.barra, { anoAtual: ano })}

    <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">

        <div class="bg-white shadow-md rounded-md p-4 mb-6">
            <p class="text-gray-700 text-justify"><b>Feriados ${mes} ${ano}:</b> confira abaixo todos os feriados ${mes} ${ano}, basta clicar no dia e visualizar os detalhes da data, caso tenha dúvidas verifique a legenda de cores do calendário de feriados ${mes} ${ano}.</p>
        </div>

        <div id="calendario" class="mb-6 max-w-md mx-auto">
            ${renderCalendarioHtml()}
        </div>

        <div class="mb-6">
            ${renderLegendaHtml(['nacional', 'facultativo'])}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados ${mes} ${ano}</h2>
                    <p class="text-gray-700 text-justify">É importante ressaltar que os feriados listados no calendário acima são feriados nacionais de ${mes} ${ano}, se você deseja visualizar estaduais ou municipais é preciso escolher o estado / cidade no filtro.</p>
                </div>

                <div id="faq" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-xl font-semibold text-gray-800 text-center">Feriados em ${mes} ${ano}</h2>
                    <p class="text-center text-gray-600 mt-1">Confira abaixo algumas perguntas e respostas sobre os feriados em ${mes} ${ano}.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div itemscope itemtype="https://schema.org/FAQPage" class="md:col-span-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${renderFaqHtml(faqQuestions)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold" id="comentarios-${ano}-${slugMes}">Avaliações da página ${mes}</h2>
                    <p class="text-gray-700 text-justify mt-2">Já consultou os feriados de ${mes} ${ano}? Compartilhe sua experiência avaliando a precisão das datas e a utilidade das informações.</p>
                </div>

                ${renderizarAvaliacoes(data.comentarios || [])}

                ${renderFormularioComentario(config)}
            </div>

            <aside class="flex flex-col gap-6">
                ${sumarioHtml}
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
        `${config.dominio}/${ano}/${slugMes}/`,
        null
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}