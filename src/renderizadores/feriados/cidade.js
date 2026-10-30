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
    const imagem    = `${config.url_cdn_imagens}/feriados/${ano}/${uf}/${slug}.webp`;

    const srcsetImagem = [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950]
        .map(w => `${imagem}?tr=w-${w} ${w}w`)
        .join(', ');

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
        { titulo: `Feriados ${cidade} ${ano}`,          href: '#sobre-feriados' },
        { titulo: `Lista de feriados ${cidade} ${ano}`, href: '#lista-feriados' },
        { titulo: `Feriado ${cidade} ${ano}`,           href: '#feriado-cidade' },
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

    const cardImagemCapa = `
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">IMAGEM DE CAPA</h3>
        </div>
        <div class="p-4">
            <figure>
                <img
                    src="${imagem}"
                    data-src="${imagem}"
                    sizes="(max-width: 125px), (max-width: 150px), (max-width: 175px), (max-width: 200px), (max-width: 225px), (max-width: 250px), (max-width: 275px), (max-width: 300px), (max-width: 325px), (max-width: 350px), (max-width: 375px), (max-width: 400px), (max-width: 425px), (max-width: 450px), (max-width: 475px), (-webkit-min-device-pixel-ratio: 1.1) AND (-webkit-max-device-pixel-ratio: 1.5) 80.5vw, (-webkit-min-device-pixel-ratio: 1.6) AND (-webkit-max-device-pixel-ratio: 2) 57.5vw, (-webkit-min-device-pixel-ratio: 2.1) AND (-webkit-max-device-pixel-ratio: 2.5) 42.5vw, (-webkit-min-device-pixel-ratio: 2.6) AND (-webkit-max-device-pixel-ratio: 3) 39.5vw, (-webkit-min-device-pixel-ratio: 3.1) AND (-webkit-max-device-pixel-ratio: 3.5) 32.5vw, (-webkit-min-device-pixel-ratio: 3.6) AND (-webkit-max-device-pixel-ratio: 4) 28.5vw"
                    data-srcset="${srcsetImagem}"
                    class="img-fluid w-full rounded fade-in"
                    title="Feriados ${cidade} ${ano}"
                    alt="Feriados ${cidade} ${ano}"
                    itemprop="image"
                    loading="lazy"
                    srcset="${srcsetImagem}">
            </figure>
        </div>
    </div>`;

    const cardNumeros = `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">NÚMEROS DE ${ano}</h3>
        </div>
        <div class="p-4">
            <div id="numeros-container"></div>
        </div>
    </div>`;

    const cardFeriadoes = `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">FERIADÕES DE ${ano}</h3>
        </div>
        <div class="p-4">
            <div id="feriadoes-container"></div>
        </div>
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

        <div id="proximo-feriado-container"></div>

        <div class="bg-white shadow-md rounded-md p-4 mb-6">
            <p class="text-gray-700 text-justify">${data.paragrafo1 || `<b>Feriados ${cidade} ${ano}:</b> confira abaixo todos os feriados ${cidade} ${ano}, basta clicar no dia e visualizar os detalhes da data, caso tenha dúvidas verifique a legenda de cores do calendário de feriados ${cidade} ${uf} ${ano}.`}</p>
        </div>

        <div id="calendario" class="mb-6">
            ${renderCalendarioHtml()}
        </div>

        <div class="mb-6">
            ${renderLegendaHtml(['nacional', 'estadual', 'municipal', 'facultativo'])}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">

                <div id="sobre-feriados" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados ${cidade} ${ano}</h2>
                    <p class="text-gray-700 text-justify">${data.paragrafo2 || `É importante ressaltar que os feriados da cidade de ${cidade} ${ano} podem sofrer alterações a qualquer momento, isso porque as cidades possuem autonomia para criar e alterar novos feriados.`}</p>
                </div>

                <div id="lista-feriados" class="bg-white rounded-md border border-gray-200 p-4">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h2 class="text-lg md:text-xl font-semibold">Lista de feriados ${cidade} ${ano}</h2>
                    </div>
                    <div id="feriados">${tabelaFeriados}</div>
                </div>

                <div id="feriado-cidade" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriado ${cidade} ${ano}</h2>
                    <p class="text-gray-700 text-justify">${data.paragrafo3 || `Caso tenha alguma sugestão a respeito de algum feriado ${cidade} ${ano} fique à vontade para enviar um comentário no formulário abaixo.`}</p>
                </div>

                <div id="comparacao-container"></div>

                <div id="faq" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados em ${cidade} ${ano}</h2>
                    <p class="text-gray-700 text-justify mb-4">Confira abaixo algumas perguntas e respostas sobre os feriados ${cidade} ${ano}.</p>
                    <div itemscope itemtype="https://schema.org/FAQPage" class="grid grid-cols-1 gap-6">
                        ${renderFaqHtml(faqQuestions)}
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
                ${cardImagemCapa}
                ${sumarioHtml}
                ${renderLinksUteisHtml()}
                ${cardNumeros}
                ${cardFeriadoes}
            </aside>
        </div>
    </div>

    ${renderScriptsFeriados(feriados, {
        ano,
        contexto: 'cidade',
        label: cidade,
        comparacao: data.comparacao || null,
    })}
    ${renderScriptsTurnstile(config)}
    `;

    const meta = gerarMetaTags(
        config,
        titulo,
        descricao,
        `${config.dominio}/${ano}/${uf}/${slug}/`,
        imagem
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}