// src/renderizadores/paginas/quem-somos.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';

export function render(config, pagina, dados = {}) {
    const { scriptsAdicionais = '' } = dados;

    const cardsArray = [
        { icone: 'pe-7s-headphones', titulo: 'Dúvidas', descricao: 'Você pode utilizar nosso formulário para esclarecer dúvidas que possa ter sobre a plataforma.' },
        { icone: 'pe-7s-portfolio', titulo: 'Parcerias', descricao: 'Caso você tenha alguma proposta de parceria, você pode nos enviar utilizando o formulário.' },
        { icone: 'pe-7s-speaker', titulo: 'Anúncios', descricao: 'Caso esteja buscando informações sobre anunciar seu produto ou serviço em nossa plataforma.' }
    ];

    const conteudoHtml = `
        <h2 class="text-2xl font-bold mb-4">Bem-vindo ao Portal de Feriados</h2>
        <p class="text-gray-700 mb-4 text-justify">Bem-vindo ao nosso Portal de Feriados, onde celebramos a alegria de momentos especiais e a diversidade cultural que os feriados proporcionam. Somos uma equipe dedicada apaixonada por compartilhar informações precisas e interessantes sobre feriados ao redor do mundo. Nosso compromisso é fornecer um guia abrangente que celebre tradições únicas, festivais vibrantes e dias comemorativos que unem as pessoas em todo o globo.</p>
        <p class="text-gray-700 mb-4 text-justify">No coração da nossa missão está o desejo de enriquecer a sua experiência festiva, oferecendo dados confiáveis e curiosidades fascinantes sobre os feriados que marcam o calendário. Cada feriado é uma oportunidade para aprender, apreciar diferentes culturas e fortalecer os laços familiares e comunitários. Nossa equipe está empenhada em trazer a você um portal dinâmico, repleto de informações valiosas que tornam suas celebrações mais significativas.</p>
        <p class="text-gray-700 mb-4 text-justify">Ao explorar nosso Portal de Feriados, convidamos você a se conectar conosco e compartilhar suas próprias tradições festivas. Juntos, podemos construir uma comunidade online onde a alegria, a diversidade e a celebração são celebradas em todas as ocasiões. Agradecemos por fazer parte da nossa jornada e por escolher o nosso portal como seu guia confiável no emocionante mundo dos feriados. Celebrando juntos, cada dia especial se torna uma memória duradoura.</p>
    `;

    let cardsHtml = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">';
    cardsArray.forEach(card => {
        cardsHtml += `
            <div class="bg-white rounded-md shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                <div class="text-4xl text-blue-600 mb-4"><i class="${card.icone}"></i></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${card.titulo}</h3>
                <p class="text-gray-600">${card.descricao}</p>
            </div>
        `;
    });
    cardsHtml += '</div>';

    const logoUrl = config.logo ? `${config.url_cdn_imagens}/${config.logo}.webp` : '';
    const logoHtml = logoUrl
        ? `<figure class="block-reveal relative overflow-hidden rounded-md"><div class="block-horizzontal absolute inset-0 bg-white z-10 animate-reveal"></div><img src="${logoUrl}" alt="${config.nome}" class="w-full h-auto fade-in" loading="lazy" /></figure>`
        : `<h2 class="text-2xl font-bold text-center mb-6">${config.nome}</h2>`;

    const conteudo = `
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">
            <div class="bg-white rounded-md shadow-md p-6 mb-8">${logoHtml}</div>
            <div class="bg-white rounded-md shadow-md p-6">
                <div class="prose max-w-none">${conteudoHtml}</div>
            </div>
            ${cardsHtml}
        </div>
    `;

    const imagemCapa = pagina.imagem_destaque
        ? `${config.url_cdn_imagens}/paginas/capa/${pagina.imagem_destaque}`
        : `${config.url_cdn_imagens}/paginas/capa/${pagina.slug}.webp`;

    const meta = gerarMetaTags(
        config,
        pagina.meta_titulo,
        pagina.meta_descricao,
        `${config.dominio}/${pagina.slug}/`,
        imagemCapa
    );

    return renderizarBase(config, conteudo, meta, scriptsAdicionais);
}