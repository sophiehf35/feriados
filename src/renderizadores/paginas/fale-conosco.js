// src/renderizadores/paginas/fale-conosco.js

import { renderizarBase, gerarMetaTags } from '@sophiehf35/plataforma-base';

export function render(config, pagina, dados = {}) {
    const { scriptsAdicionais = '' } = dados;

    const cards = [
        { icone: 'pe-7s-headphones', titulo: 'Dúvidas', descricao: 'Você pode utilizar nosso formulário para esclarecer dúvidas que possa ter sobre a plataforma.' },
        { icone: 'pe-7s-portfolio', titulo: 'Parcerias', descricao: 'Caso você tenha alguma proposta de parceria, você pode nos enviar utilizando o formulário.' },
        { icone: 'pe-7s-speaker', titulo: 'Anúncios', descricao: 'Caso esteja buscando informações sobre anunciar seu produto ou serviço em nossa plataforma.' }
    ];

    const campos = [
        { nome: 'nome', tipo: 'text', label: 'Nome', coluna: 'lg:w-1/2 w-full', obrigatorio: true, placeholder: 'Nome *' },
        { nome: 'tipo', tipo: 'select', label: 'Eu sou', coluna: 'lg:w-1/2 w-full', opcoes: [
            { texto: 'Usuário', valor: 'usuario' },
            { texto: 'Anunciante', valor: 'anunciante' },
            { texto: 'Parceiro', valor: 'parceiro' },
            { texto: 'Outros', valor: 'outros' }
        ], obrigatorio: true, placeholder: 'Selecione' },
        { nome: 'telefone', tipo: 'text', label: 'Telefone', coluna: 'lg:w-1/2 w-full', obrigatorio: true, placeholder: 'Telefone *' },
        { nome: 'email', tipo: 'email', label: 'Email', coluna: 'lg:w-1/2 w-full', obrigatorio: true, placeholder: 'Email *' },
        { nome: 'mensagem', tipo: 'textarea', label: 'Mensagem', coluna: 'w-full', linhas: 5, obrigatorio: true, placeholder: 'Digite sua mensagem...' }
    ];

    const conteudoTexto = '<p class="text-gray-600">Descreva a sua solicitação no formulário abaixo. Nossa equipe responderá o mais breve possível.</p>';
    const camposObrigatorios = campos.filter(c => c.obrigatorio).map(c => c.nome);
    const scriptConfig = `<script>window.__FALE_CONOSCO_CONFIG = {camposObrigatorios: ${JSON.stringify(camposObrigatorios)}};<\/script>`;

    const labelClass = 'absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 pointer-events-none';
    const labelTextareaClass = 'absolute text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 top-2 z-10 origin-[0] bg-white px-2 start-1 peer-focus:text-blue-600 pointer-events-none';

    let camposHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    campos.forEach(campo => {
        const { tipo, nome, label, placeholder, obrigatorio, opcoes, coluna = 'w-full', linhas } = campo;
        const baseClass = 'block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer';
        let inputHtml = '';
        let labelToUse = labelClass;
        if (tipo === 'textarea') {
            inputHtml = `<textarea id="campo_${nome}" name="${nome}" rows="${linhas || 4}" placeholder=" " class="${baseClass}"></textarea>`;
            labelToUse = labelTextareaClass;
        } else if (tipo === 'select') {
            inputHtml = `<select id="campo_${nome}" name="${nome}" class="${baseClass}">
                ${placeholder ? `<option value="" disabled selected hidden>${placeholder}</option>` : ''}
                ${(opcoes || []).map(o => `<option value="${o.valor}">${o.texto}</option>`).join('')}
            </select>`;
        } else {
            inputHtml = `<input type="${tipo || 'text'}" id="campo_${nome}" name="${nome}" placeholder=" " class="${baseClass}">`;
        }
        const colSpan = coluna === 'w-full' ? 'md:col-span-2' : '';
        camposHtml += `<div class="relative ${colSpan}">${inputHtml}${label ? `<label for="campo_${nome}" class="${labelToUse}">${label} ${obrigatorio ? '<span class="text-red-600">*</span>' : ''}</label>` : ''}</div>`;
    });
    camposHtml += '</div>';

    const turnstileHtml = config.possui_turnstile && config.codigo_sitekey_turnstile ? `
        <div class="cf-turnstile mt-4" data-sitekey="${config.codigo_sitekey_turnstile}" data-theme="light"></div>
        <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response">
    ` : '';

    const turnstileScript = config.possui_turnstile && config.codigo_sitekey_turnstile ? `
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
    ` : '';

    let cardsHtml = '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">';
    cards.forEach(c => {
        cardsHtml += `
            <div class="bg-white rounded-md shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div class="text-4xl text-blue-600 mb-4"><i class="${c.icone}"></i></div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${c.titulo}</h3>
                <p class="text-gray-600">${c.descricao}</p>
            </div>
        `;
    });
    cardsHtml += '</div>';

    const conteudo = `
        <div class="xl:max-w-5xl 2xl:max-w-7xl max-xl:p-4 mx-auto py-8">
            <div class="bg-white rounded-md shadow-md p-4">
                ${scriptConfig}
                <div class="text-center mb-6">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Envie uma Mensagem</h2>
                    <div class="prose max-w-none mt-2">${conteudoTexto}</div>
                </div>
                <form method="post" id="formulario_de_contato" autocomplete="off" class="space-y-4">
                    ${camposHtml}
                    ${turnstileHtml}
                    <button type="button" id="enviar_contato" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 mb-0 rounded-md transition-colors">Enviar Contato</button>
                    <div id="div_notificacao_contato" class="mt-4 d-none"></div>
                    <div id="div_barra_contato" class="d-none"></div>
                </form>
            </div>
            ${cardsHtml}
        </div>
        ${turnstileScript}
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