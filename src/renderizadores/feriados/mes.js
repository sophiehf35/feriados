// src/renderizadores/feriados/mes.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml, capitalizar } from '../../js/utils.js';
import {
    organizaFeriados,
    filtrarFeriados,
    renderizarBarra,
    renderizarCalendarioHtml,
    renderizarLegendaHtml,
    renderizarSumarioHtml,
    renderizarFaqHtml,
    renderizarLinksUteisHtml,
    renderizarScriptsFeriados,
} from './_utils.js';
import {
    renderizarAvaliacoes,
    renderizarFormularioComentario,
    renderizarScriptsTurnstile,
} from './_avaliacoes.js';

export function renderizar(config, data, contexto = {}) {
    const { scriptsAdicionais = '' } = contexto;

    const ano = String(data.ano);
    const mes = capitalizar(data.mes);
    const slugMes = data.slug;

    const titulo    = data.meta_titulo_google    || `Feriados ${mes} ${ano}`;
    const descricao = data.meta_descricao_google || '';
    const imagem    = `${config.url_cdn_imagens}/feriados/${ano}/${slugMes}.webp`;

    const srcsetImagem = [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950]
        .map(w => `${imagem}?tr=w-${w} ${w}w`)
        .join(', ');

    const feriados = organizaFeriados(ano, (data.feriados_concatenados || '').split(';'));

    const feriadosMes         = filtrarFeriados(feriados, 'Feriado Nacional');
    const pontoFacultativoMes = filtrarFeriados(feriados, 'Ponto Facultativo');

    const semFeriados = feriadosMes.numero === 0;

    const faqQuestions = semFeriados
        ? [
            {
                pergunta: `Existem feriados em ${mes} ${ano}?`,
                resposta: `Não há feriados nacionais em ${mes} de ${ano}. No entanto, alguns estados e municípios podem ter feriados locais nesse mês — consulte seu estado ou cidade no filtro acima para verificar.`
            },
            {
                pergunta: `Quando cai o próximo feriado depois de ${mes} ${ano}?`,
                resposta: `O próximo feriado nacional após ${mes} de ${ano} pode ser conferido no calendário ${ano} completo. Clique em "${ano}" no filtro de ano acima.`
            }
        ]
        : [
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

    const sumarioHtml = renderizarSumarioHtml([
        { titulo: `Feriados ${mes} ${ano}`, href: '#sobre-feriados' },
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

    const introHtml = data.paragrafo1
        ? `<p class="text-gray-700 text-justify">${data.paragrafo1}</p>`
        : (semFeriados
            ? `<p class="text-gray-700 text-justify"><b>Feriados ${mes} ${ano}:</b> não há feriados nacionais em ${mes} de ${ano}. O calendário abaixo está vazio para feriados nacionais, mas estados e municípios podem ter feriados locais — consulte o filtro acima.</p>`
            : `<p class="text-gray-700 text-justify"><b>Feriados ${mes} ${ano}:</b> confira abaixo todos os feriados ${mes} ${ano}, basta clicar no dia e visualizar os detalhes da data, caso tenha dúvidas verifique a legenda de cores do calendário de feriados ${mes} ${ano}.</p>`);

    const blocoPrincipalHtml = data.paragrafo2
        ? `
        <div id="sobre-feriados" class="bg-white shadow-md rounded-md p-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados ${mes} ${ano}</h2>
            <p class="text-gray-700 text-justify">${data.paragrafo2}</p>
        </div>`
        : (semFeriados
            ? `
        <div id="sobre-feriados" class="bg-white shadow-md rounded-md p-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados ${mes} ${ano}</h2>
            <p class="text-gray-700 text-justify mb-3">Não há feriados nacionais em <b>${mes} de ${ano}</b>. Este mês não tem datas comemorativas de abrangência nacional — mas ainda pode ter feriados estaduais ou municipais, que variam conforme a região.</p>
            <p class="text-gray-700 text-justify mb-3">Se você está planejando uma viagem ou folga em ${mes} ${ano}, vale conferir o calendário do seu estado ou cidade. Alguns feriados locais (como datas religiosas, aniversários de cidades ou datas estaduais) podem cair nesse mês.</p>
            <p class="text-gray-700 text-justify">Confira também os <a href="/${ano}/" class="text-primary hover:underline font-medium">feriados nacionais de ${ano}</a> para ver o panorama completo do ano, ou consulte os <a href="/${ano}/#estados" class="text-primary hover:underline font-medium">feriados por estado em ${ano}</a>.</p>
        </div>`
            : `
        <div id="sobre-feriados" class="bg-white shadow-md rounded-md p-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados ${mes} ${ano}</h2>
            <p class="text-gray-700 text-justify">É importante ressaltar que os feriados listados no calendário acima são feriados nacionais de ${mes} ${ano}, se você deseja visualizar estaduais ou municipais é preciso escolher o estado / cidade no filtro.</p>
        </div>`);

    const blocoParagrafo3Html = data.paragrafo3
        ? `
        <div class="bg-white shadow-md rounded-md p-4">
            <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Mais sobre ${mes} ${ano}</h2>
            <p class="text-gray-700 text-justify">${data.paragrafo3}</p>
        </div>`
        : '';

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
                    title="Feriados ${mes} ${ano}"
                    alt="Feriados ${mes} ${ano}"
                    itemprop="image"
                    loading="lazy"
                    srcset="${srcsetImagem}">
            </figure>
        </div>
    </div>`;

    const cardNumeros = `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">NÚMEROS DE ${mes.toUpperCase()} ${ano}</h3>
        </div>
        <div class="p-4">
            <div id="numeros-container"></div>
        </div>
    </div>`;

    const cardFeriadoes = `
    <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider">FERIADÕES DE ${mes.toUpperCase()} ${ano}</h3>
        </div>
        <div class="p-4">
            <div id="feriadoes-container"></div>
        </div>
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

    ${renderizarBarra(data.barra, { anoAtual: ano })}

    <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">

        <div id="proximo-feriado-container"></div>

        <div class="bg-white shadow-md rounded-md p-4 mb-6">
            ${introHtml}
        </div>

        <div id="calendario" class="mb-6 max-w-md mx-auto">
            ${renderizarCalendarioHtml()}
        </div>

        <div class="mb-6">
            ${renderizarLegendaHtml(['nacional', 'facultativo'])}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                ${blocoPrincipalHtml}
                ${blocoParagrafo3Html}

                <div id="comparacao-container"></div>

                <div id="faq" class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-3">Feriados em ${mes} ${ano}</h2>
                    <p class="text-gray-700 text-justify mb-4">Confira abaixo algumas perguntas e respostas sobre os feriados em ${mes} ${ano}.</p>
                    <div itemscope itemtype="https://schema.org/FAQPage" class="grid grid-cols-1 gap-6">
                        ${renderizarFaqHtml(faqQuestions)}
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-md p-4">
                    <h2 class="text-lg md:text-xl font-semibold" id="comentarios-${ano}-${slugMes}">Avaliações da página ${mes}</h2>
                    <p class="text-gray-700 text-justify mt-2">Já consultou os feriados de ${mes} ${ano}? Compartilhe sua experiência avaliando a precisão das datas e a utilidade das informações.</p>
                </div>

                ${renderizarAvaliacoes(data.comentarios || [])}

                ${renderizarFormularioComentario(config)}
            </div>

            <aside class="flex flex-col gap-6">
                ${cardImagemCapa}
                ${sumarioHtml}
                ${renderizarLinksUteisHtml()}
                ${cardNumeros}
                ${cardFeriadoes}
            </aside>
        </div>
    </div>

    ${renderizarScriptsFeriados(feriados, {
        ano,
        contexto: 'mes',
        label: mes,
        comparacao: data.comparacao || null,
    })}
    ${renderizarScriptsTurnstile(config)}
    `;

    const meta = gerarMetaTags(
        config,
        titulo,
        descricao,
        `${config.dominio}/${ano}/${slugMes}/`,
        imagem
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}