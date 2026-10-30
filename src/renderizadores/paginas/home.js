// src/renderizadores/paginas/home.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';
import { escapeHtml, capitalizar } from '../../js/utils.js';
import { renderBarra, renderSumarioHtml, renderFaqHtml } from '../feriados/_utils.js';

const ANOS_FALLBACK = ['2026', '2025', '2024'];

export async function render(config, pagina, dados = {}) {
    const { supabase, scriptsAdicionais = '' } = dados;

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
    const imgTitle   = 'Feriados - Calendário nacional, estadual e municipal';
    const imgAlt     = 'Feriados - Calendário nacional, estadual e municipal';

    // ─────────────────────────────────────────────────────────
    // Cards do carrossel — MESMO padrão do correios:
    //   src real + data-src real + srcset + data-srcset + fade-in + lazy
    // O fallback (mais abaixo, no script) garante visibilidade
    // se o IntersectionObserver da base não pegar os slides ocultos.
    // ─────────────────────────────────────────────────────────
    const cardsAnos = anos.map(ano => {
        const srcImg   = `${config.url_cdn_imagens}/feriados/${ano}.webp`;
        const srcsetImg = [250, 300, 376, 450, 550, 700, 900]
            .map(w => `${srcImg}?tr=w-${w} ${w}w`)
            .join(', ');

        return `
    <div class="swiper-slide h-auto">
        <div class="card box_detail p-0 bg-white shadow-md rounded-md overflow-hidden h-full flex flex-col">
            <img
                width="376" height="211"
                src="${srcImg}"
                data-src="${srcImg}"
                srcset="${srcsetImg}"
                data-srcset="${srcsetImg}"
                sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 376px"
                class="img-fluid w-full card-img-top fade-in"
                title="Feriados ${ano}"
                alt="Imagem ilustrativa dos feriados ${ano}"
                loading="lazy">
            <div class="card-body p-4 flex flex-col flex-grow">
                <h2 class="card-title text-xl font-semibold mb-2">
                    <a href="/${ano}/" class="text-gray-800 hover:text-primary">Feriados ${ano}</a>
                </h2>
                <p class="card-text text-gray-600 text-sm mb-3 flex-grow">
                    Confira todos os feriados do ano de ${ano}, incluindo os feriados nacionais, estaduais, municipais e pontos facultativos.
                </p>
                <a href="/${ano}/" class="block text-center bg-botao-acao hover:brightness-110 text-white font-medium py-2 px-4 rounded-md transition">Ver feriados</a>
            </div>
        </div>
    </div>`;
    }).join('');

    const faqQuestions = [
        { pergunta: 'O que é ponto facultativo?', resposta: 'Ponto facultativo é um dia de trabalho opcional para empregadores e funcionários, diferindo dos feriados obrigatórios. A decisão de funcionamento cabe a cada organização.' },
        { pergunta: 'O que é feriado nacional?', resposta: 'Feriado nacional é uma data comemorativa oficial em todo o país. É decretado pelo governo federal e celebrado por toda a população.' },
        { pergunta: 'O que é feriado estadual?', resposta: 'Feriado estadual é uma data comemorativa oficial dentro de um estado específico. É decretado pelo governo estadual e celebrado apenas pela população daquele estado.' },
        { pergunta: 'O que é feriado municipal?', resposta: 'Feriado municipal é uma data comemorativa oficial dentro de um município. É decretado pelo governo municipal e celebrado apenas pelos moradores daquele município.' },
    ];

    const sumarioHtml = renderSumarioHtml([
        { titulo: 'Feriados', href: '#feriado' },
        { titulo: 'Feriados nacionais', href: '#feriado-nacional' },
        { titulo: 'Feriado nacional', href: '#feriado-nacional-single' },
        { titulo: 'Feriado Brasil', href: '#feriado-brasil' },
        { titulo: 'Perguntas frequentes', href: '#faq' },
    ]);

    // ─────────────────────────────────────────────────────────
    // Card "IMAGEM DE CAPA" — EXATAMENTE como o correios:
    //   src real + data-src + srcset + data-srcset + sizes
    //   + class="img-fluid w-full rounded fade-in"
    //   + itemprop="image" + loading="lazy"
    // ─────────────────────────────────────────────────────────
    const tamanhos = "(max-width: 125px), (max-width: 150px), (max-width: 175px), (max-width: 200px), (max-width: 225px), (max-width: 250px), (max-width: 275px), (max-width: 300px), (max-width: 325px), (max-width: 350px), (max-width: 375px), (max-width: 400px), (max-width: 425px), (max-width: 450px), (max-width: 475px), (-webkit-min-device-pixel-ratio: 1.1) AND (-webkit-max-device-pixel-ratio: 1.5) 80.5vw, (-webkit-min-device-pixel-ratio: 1.6) AND (-webkit-max-device-pixel-ratio: 2) 57.5vw, (-webkit-min-device-pixel-ratio: 2.1) AND (-webkit-max-device-pixel-ratio: 2.5) 42.5vw, (-webkit-min-device-pixel-ratio: 2.6) AND (-webkit-max-device-pixel-ratio: 3) 39.5vw, (-webkit-min-device-pixel-ratio: 3.1) AND (-webkit-max-device-pixel-ratio: 3.5) 32.5vw, (-webkit-min-device-pixel-ratio: 3.6) AND (-webkit-max-device-pixel-ratio: 4) 28.5vw";

    const srcsetCapa = [250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950]
        .map(w => `${imagemCapa}?tr=w-${w} ${w}w`)
        .join(', ');

    const cardImagemCapa = `
    <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
      <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
        <h3 class="text-sm font-semibold text-white uppercase tracking-wider">IMAGEM DE CAPA</h3>
      </div>
      <div class="p-4">
        <figure>
          <img
            src="${imagemCapa}"
            data-src="${imagemCapa}"
            sizes="${tamanhos}"
            data-srcset="${srcsetCapa}"
            class="img-fluid w-full rounded fade-in"
            title="${imgTitle}"
            alt="${imgAlt}"
            itemprop="image"
            loading="lazy"
            srcset="${srcsetCapa}"
          >
        </figure>
      </div>
    </div>`;

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
        <div class="anos-carrossel relative">
          <div class="swiper anos-swiper !pb-12">
            <div class="swiper-wrapper">
              ${cardsAnos}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-8">
      <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto space-y-6">

        ${sumarioHtml}

        <div id="feriado" class="bg-white shadow-md rounded-md p-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados</h2>
          <p class="text-gray-700 text-justify mb-3">Ah, como é maravilhoso acordar pela manhã e perceber que o dia é envolto pela magia de um feriado! É como se o tempo desacelerasse, abrindo espaço para momentos de alegria e descontração. O aroma do café paira no ar, misturando-se com a expectativa de um dia livre de obrigações. As ruas, normalmente agitadas, tornam-se mais calmas, e o sol parece sorrir ainda mais radiante, como se estivesse cúmplice da felicidade que esse dia especial traz consigo.</p>
          <p class="text-gray-700 text-justify">Cada feriado é como uma paleta de cores, pintando nossas vidas com tonalidades vibrantes de descanso e diversão. É a oportunidade perfeita para reencontrar amigos e familiares, compartilhar risadas e criar memórias que se tornarão tesouros em nosso coração. A atmosfera festiva é contagiante, e a sensação de liberdade nos permite saborear cada momento com gratidão. Os feriados não são apenas pausas no calendário, mas pausas no ritmo frenético da vida, proporcionando-nos um refúgio onde podemos recarregar as energias e celebrar a preciosidade do tempo junto àqueles que amamos.</p>
        </div>

        <div id="feriado-nacional" class="bg-white shadow-md rounded-md p-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriados nacionais</h2>
          <p class="text-gray-700 text-justify mb-3">O ano começa com uma alegria contagiante, e a ansiedade pela chegada dos feriados já se faz presente nos corações de todos. Entre as datas marcadas no calendário, o feriado de 2024 promete ser uma celebração memorável, repleta de momentos especiais e emocionantes. As ruas ganharão um colorido diferente, com decorações festivas que refletiam a atmosfera de alegria que pairava no ar.</p>
          <p class="text-gray-700 text-justify">Nesses feriados tão aguardados, as famílias se reunirão com sorrisos sinceros, compartilhando risadas e histórias que fortaleciam os laços afetivos. As praças e parques serão palcos de encontros animados, onde amigos irão se abraçar calorosamente, celebrando a oportunidade de estar juntos. O brilho nos olhos das crianças ao vislumbrarem as festividades será cativante, transmitindo a magia que somente os feriados conseguem proporcionar. A energia positiva irá permear o ambiente, fazendo com que cada momento seja vivido intensamente, transformando os feriados em lembranças eternamente guardadas no coração de todos.</p>
        </div>

        <div id="feriado-nacional-single" class="bg-white shadow-md rounded-md p-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriado nacional</h2>
          <p class="text-gray-700 text-justify mb-3">O feriado nacional promete ser um verdadeiro espetáculo de união e celebração em todo o país. Desde as primeiras horas da manhã, a expectativa e o entusiasmo começam a contagiar as pessoas, que se preparam para uma jornada especial de descanso e confraternização. As cidades se preparam para ganhar um brilho peculiar, decoradas com cores vibrantes e símbolos que ressaltarão o orgulho nacional.</p>
          <p class="text-gray-700 text-justify">Nesse dia singular, as praças e as ruas se transformarão em palcos de festa, onde a diversidade cultural do país se manifestará em danças, músicas e comidas típicas. As famílias se reunirão em almoços animados, compartilhando histórias e tradições que ecoam os valores fundamentais da nação. O sentimento de pertencimento e gratidão permeará cada abraço e sorriso, criando memórias que transcenderão o próprio feriado. O feriado nacional não será apenas um intervalo no calendário, mas uma celebração emocionante da riqueza e da união que tornam cada cidadão parte integrante desse grande mosaico cultural.</p>
        </div>

        <div id="feriado-brasil" class="bg-white shadow-md rounded-md p-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Feriado Brasil</h2>
          <p class="text-gray-700 text-justify mb-3">O feriado no Brasil é como um abraço caloroso que envolve todo o país em uma atmosfera de alegria e descontração. É um momento em que as cores da nossa diversidade se misturam, criando um verdadeiro arco-íris cultural. Desde as praias ensolaradas até as montanhas verdejantes, o Brasil ganha vida com celebrações que refletem a riqueza de nossas tradições.</p>
          <p class="text-gray-700 text-justify">Nesses dias especiais, os corações se enchem de gratidão e alegria, enquanto as famílias se reúnem para compartilhar risadas, sabores e memórias. As cidades pulsam com a energia contagiante de desfiles, festivais e eventos que destacam o espírito vibrante e acolhedor do povo brasileiro. O feriado no Brasil não é apenas um intervalo no calendário, é uma oportunidade para celebrar nossa identidade única e fortalecer os laços que nos unem como uma nação apaixonada.</p>
        </div>

        ${cardImagemCapa}

        <div id="faq" class="bg-white shadow-md rounded-md p-4">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-3">Perguntas Frequentes</h2>
          <div itemscope itemtype="https://schema.org/FAQPage" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${renderFaqHtml(faqQuestions)}
          </div>
        </div>
      </div>
    </section>

    <script id="dados-barra-cidades" type="application/json">${JSON.stringify(barra.cidades || [])}</script>
    `;

    const meta = gerarMetaTags(config, titulo, descricao, config.dominio, imagemCapa);

    // ─────────────────────────────────────────────────────────
    // Swiper + fallback de lazy load
    // ─────────────────────────────────────────────────────────
    const scriptsCarrossel = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <style>
      .anos-swiper .swiper-slide { height: auto; }
      .anos-swiper .swiper-slide img { display: block; }
    </style>
    <script>
    (function () {
      function carregarImagensCarrossel() {
        // Fallback: força o carregamento das imagens do carrossel
        // (o IntersectionObserver da base pode não pegar os slides
        // ocultos pelo transform do Swiper).
        var wrapper = document.querySelector('.anos-swiper .swiper-wrapper');
        if (!wrapper) return;
        wrapper.querySelectorAll('img[data-src]').forEach(function (img) {
          var ds = img.getAttribute('data-src');
          var dss = img.getAttribute('data-srcset');
          if (ds && img.getAttribute('src') !== ds) img.setAttribute('src', ds);
          if (dss && img.getAttribute('srcset') !== dss) img.setAttribute('srcset', dss);
          img.classList.remove('fade-in');
          if (!img.style.opacity) img.style.opacity = '1';
        });
      }

      function initAnosSwiper() {
        var el = document.querySelector('.anos-swiper');
        if (!el || typeof Swiper === 'undefined') { carregarImagensCarrossel(); return; }
        if (!el.classList.contains('swiper-initialized')) {
          new Swiper(el, {
            slidesPerView: 1,
            spaceBetween: 24,
            watchOverflow: true,
            grabCursor: true,
            pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
            navigation: {
              nextEl: el.querySelector('.swiper-button-next'),
              prevEl: el.querySelector('.swiper-button-prev')
            },
            breakpoints: {
              640:  { slidesPerView: 1, spaceBetween: 16 },
              768:  { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 }
            }
          });
        }

        // Após o Swiper posicionar os slides, força o carregamento
        // (o fallback cobre o caso do observer da base não ver slides ocultos)
        setTimeout(carregarImagensCarrossel, 50);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnosSwiper);
      } else {
        initAnosSwiper();
      }
    })();
    </script>
    `;

    return renderizarBase(config, conteudo, meta, scriptsAdicionais + scriptsCarrossel);
}