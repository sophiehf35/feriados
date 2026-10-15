// src/renderizadores/paginas/home.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml, capitalizar } from '../../js/utils.js';
import {
    renderBarra, renderLegenda, renderLinksUteisHtml,
    renderSumarioHtml, renderFaqHtml,
} from '../feriados/_utils.js';

const ANOS_FALLBACK = ['2026', '2025', '2024'];

export async function render(config, pagina, dados = {}) {
    const { supabase, scriptsAdicionais = '' } = dados;

    // 1 chamada: anos + estados + cards dos anos
    let barra = { anos: [], estados: [], cidades: [] };
    let anos = [];

    try {
        const { data, error } = await supabase.rpc('get_home_feriados');
        if (!error && data) {
            barra = data.barra || barra;
            anos = data.anos || [];
        }
    } catch (_) {}

    if (!anos.length) anos = ANOS_FALLBACK;

    const titulo = pagina.meta_titulo || 'Feriados nacionais | feriados estaduais | feriados municipais';
    const descricao = pagina.meta_descricao || '';
    const imagemCapa = `${config.url_cdn_imagens}/paginas/capa/${pagina.slug}.webp`;

    const cardsAnos = anos.map(ano => `
    <div class="col-md-4">
        <div class="card box_detail p-0 bg-white shadow-md rounded-md overflow-hidden">
            <img width="376" height="211"
                src="${config.url_cdn_imagens}/${ano}/feriados-nacionais.webp"
                class="img-fluid fade-in card-img-top w-full"
                title="Feriados ${ano}" alt="Imagem ilustrativa dos feriados ${ano}" loading="lazy">
            <div class="card-body p-4">
                <h2 class="card-title text-xl font-semibold mb-2">
                    <a href="/${ano}/" class="text-gray-800 hover:text-primary">Feriados ${ano}</a>
                </h2>
                <p class="card-text text-gray-600 text-sm mb-3">
                    Confira todos os feriados do ano de ${ano}, incluindo os feriados nacionais, estaduais, municipais e pontos facultativos.
                </p>
                <a href="/${ano}/" class="block text-center bg-botao-acao hover:brightness-110 text-white font-medium py-2 px-4 rounded-md transition">Ver feriados</a>
            </div>
        </div>
    </div>`).join('');

    const faqQuestions = [
        { pergunta: 'O que é ponto facultativo?', resposta: 'Ponto facultativo é um dia de trabalho opcional para empregadores e funcionários, diferindo dos feriados obrigatórios. A decisão de funcionamento cabe a cada organização.' },
        { pergunta: 'O que é feriado nacional?', resposta: 'Feriado nacional é uma data comemorativa oficial em todo o país. É decretado pelo governo federal e celebrado por toda a população.' },
        { pergunta: 'O que é feriado estadual?', resposta: 'Feriado estadual é uma data comemorativa oficial dentro de um estado específico. É decretado pelo governo estadual e celebrado apenas pela população daquele estado.' },
        { pergunta: 'O que é feriado municipal?', resposta: 'Feriado municipal é uma data comemorativa oficial dentro de um município. É decretado pelo governo municipal e celebrado apenas pelos moradores daquele município.' },
    ];

    const sumarioHtml = renderSumarioHtml([
        { titulo: 'Feriados', href: '#feriado' },
        { titulo: 'Feriados nacionais', href: '#feriado-nacional' },
        { titulo: 'Perguntas frequentes', href: '#faq' },
    ]);

    const conteudo = `
    <section class="filtro-estados-cidades bg-primary text-white py-8 md:py-10 w-full">
      <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto">
        <div class="text-center mb-6">
          <h1 data-nome-pagina="feriados" class="text-xl md:!text-3xl font-bold text-white uppercase drop-shadow-lg">
            FERIADOS
          </h1>
          <p class="text-base md:text-xl text-white mt-2 drop-shadow">
            Encontre os feriados de acordo com o ano / estado / cidade.
          </p>
        </div>

        ${renderBarra(barra, {})}

        <ul class="flex justify-center gap-6 mt-6 text-sm md:text-base text-white">
          <li><strong class="text-2xl font-bold">${barra.estados?.length || 27}</strong> Estados</li>
          <li><strong class="text-2xl font-bold">5570</strong> Cidades</li>
        </ul>
      </div>
    </section>

    <section class="bg-gray-50 pt-8 pb-4">
      <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${cardsAnos}
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-8">
      <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div id="feriado" class="bg-white shadow-md rounded-md p-4">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados</h2>
              <p class="text-gray-700 text-justify mb-3">Ah, como é maravilhoso acordar pela manhã e perceber que o dia é envolto pela magia de um feriado! É como se o tempo desacelerasse, abrindo espaço para momentos de alegria e descontração.</p>
              <p class="text-gray-700 text-justify">Cada feriado é como uma paleta de cores, pintando nossas vidas com tonalidades vibrantes de descanso e diversão. É a oportunidade perfeita para reencontrar amigos e familiares, compartilhar risadas e criar memórias que se tornarão tesouros em nosso coração.</p>
            </div>

            <div id="feriado-nacional" class="bg-white shadow-md rounded-md p-4">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados nacionais</h2>
              <p class="text-gray-700 text-justify mb-3">O ano começa com uma alegria contagiante, e a ansiedade pela chegada dos feriados já se faz presente nos corações de todos. Entre as datas marcadas no calendário, o feriado promete ser uma celebração memorável.</p>
              <p class="text-gray-700 text-justify">Nesses feriados tão aguardados, as famílias se reunirão com sorrisos sinceros, compartilhando risadas e histórias que fortaleciam os laços afetivos.</p>
            </div>

            <div id="faq" class="bg-white shadow-md rounded-md p-4">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">Perguntas Frequentes</h2>
              <div itemscope itemtype="https://schema.org/FAQPage" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${renderFaqHtml(faqQuestions)}
              </div>
            </div>
          </div>

          <aside class="flex flex-col gap-6">
            ${sumarioHtml}
            ${renderLegenda(['nacional', 'estadual', 'municipal', 'facultativo'])}
            ${renderLinksUteisHtml()}
          </aside>
        </div>
      </div>
    </section>

    <script id="dados-barra-cidades" type="application/json">${JSON.stringify(barra.cidades || [])}</script>
    `;

    const meta = gerarMetaTags(config, titulo, descricao, config.dominio, imagemCapa);

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}