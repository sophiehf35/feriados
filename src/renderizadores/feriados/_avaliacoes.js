// src/renderizadores/feriados/_avaliacoes.js

import { escapeHtml } from '../../js/utils.js';

const SVG_ESTRELA_PATH = 'M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z';

export const labelClassAvaliacao = 'absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 pointer-events-none';
export const labelSelectClassAvaliacao = 'absolute text-sm text-gray-500 duration-300 transform scale-75 -translate-y-4 top-2 z-10 origin-[0] bg-white px-2 start-1 peer-focus:text-blue-600 pointer-events-none';

function formatarData(dataStr) {
    if (!dataStr) return '';
    try {
        const d = new Date(dataStr);
        if (isNaN(d.getTime())) return dataStr;
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dataStr; }
}

function svgEstrela(tamanho, cor) {
    return `<svg class="${tamanho}" style="color: ${cor};" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20"><path d="${SVG_ESTRELA_PATH}"/></svg>`;
}

function estrelasHTML(nota) {
    const n = Math.round(Number(nota) || 0);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const cor = i <= n ? 'rgb(251 191 36)' : 'rgb(156 163 175)';
        html += svgEstrela('w-4 h-4', cor);
    }
    return html;
}

function estrelaMediaHTML(media, tamanho) {
    tamanho = tamanho || 'w-5 h-5';
    const px = tamanho.includes('5') ? '1.25rem' : '1rem';
    const inteira = Math.floor(media);
    const fracao = media - inteira;
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= inteira) {
            html += svgEstrela(tamanho, 'rgb(251 191 36)');
        } else if (i === inteira + 1 && fracao > 0) {
            html += `
                <div style="display: inline-block; position: relative; width: ${px}; height: ${px};">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                        ${svgEstrela(tamanho, 'rgb(156 163 175)')}
                    </div>
                    <div style="position: absolute; top: 0; left: 0; width: ${fracao * 100}%; height: 100%; overflow: hidden;">
                        ${svgEstrela(tamanho, 'rgb(251 191 36)')}
                    </div>
                </div>
            `;
        } else {
            html += svgEstrela(tamanho, 'rgb(156 163 175)');
        }
    }
    return html;
}

export function renderizarAvaliacoes(comentarios) {
    if (!Array.isArray(comentarios) || comentarios.length === 0) return '';

    const topLevel = comentarios.filter(c => !Number(c.id_comentario_pai));
    const byPai = {};
    comentarios.forEach(c => {
        const pai = Number(c.id_comentario_pai);
        if (pai) (byPai[pai] = byPai[pai] || []).push(c);
    });

    const comNota = topLevel.filter(c => Number(c.avaliacao) > 0);
    const soma = comNota.reduce((acc, c) => acc + Number(c.avaliacao), 0);
    const media = comNota.length ? soma / comNota.length : 0;
    const total = comNota.length;

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    comNota.forEach(c => {
        const n = Number(c.avaliacao);
        if (dist[n] !== undefined) dist[n]++;
    });

    const getData = (c) => c.data_hora_criacao || null;
    const ts = (c) => { const d = getData(c); return d ? new Date(d).getTime() : 0; };

    const topOrdenado = [...topLevel].sort((a, b) => ts(b) - ts(a));

    const barrasHtml = [5, 4, 3, 2, 1].map(n => {
        const qtd = dist[n];
        const pct = total > 0 ? Math.round((qtd / total) * 100) : 0;
        return `
            <div class="flex items-center gap-3 text-sm">
                <div class="flex items-center gap-1" style="min-width: 80px;">
                    <span class="flex gap-0.5">${estrelasHTML(n)}</span>
                    <span class="font-medium ml-1 text-gray-700">${n}</span>
                </div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300" style="width:${pct}%; background-color: rgb(251 191 36);"></div>
                </div>
                <span class="w-16 text-right text-gray-600 font-medium tabular-nums">${qtd} (${pct}%)</span>
            </div>
        `;
    }).join('');

    const renderCard = (c, isReply) => {
        const inicial = (c.nome || 'A').charAt(0).toUpperCase();
        const nota = Number(c.avaliacao) || 0;
        const sexoLabel = c.sexo === '1' ? 'Feminino' : c.sexo === '2' ? 'Masculino' : '';
        const wrapperClass = isReply ? 'ml-12 pl-4 border-l-2 border-gray-200' : '';

        return `
            <article class="py-5 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0 ${wrapperClass}" data-comentario-id="${c.id}">
                <header class="flex items-start gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-base">
                        ${escapeHtml(inicial)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-semibold text-gray-800">${escapeHtml(c.nome || 'Anônimo')}</span>
                            ${sexoLabel ? `<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${sexoLabel}</span>` : ''}
                            ${isReply ? `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Resposta</span>` : ''}
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                            ${!isReply ? `<span class="flex gap-0.5">${estrelasHTML(nota)}</span>` : ''}
                            <span class="text-xs text-gray-500">${formatarData(getData(c))}</span>
                        </div>
                    </div>
                </header>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">${escapeHtml(c.comentario || '')}</p>
                ${!isReply ? `
                    <div class="mt-3">
                        <button type="button" class="text-xs text-blue-600 hover:underline responder-btn" data-comentario-id="${c.id}">Responder</button>
                    </div>
                    <div class="resposta-container hidden"></div>
                ` : ''}
            </article>
        `;
    };

    const cardsHtml = topOrdenado.map(c => {
        const replies = (byPai[c.id] || []).slice().sort((a, b) => ts(a) - ts(b));
        return renderCard(c, false) + replies.map(r => renderCard(r, true)).join('');
    }).join('');

    return `
        <div class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
            <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md flex items-center justify-between">
                <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Avaliações dos usuários</h3>
                <span class="text-xs text-white/80 font-medium">${comentarios.length} ${comentarios.length === 1 ? 'comentário' : 'comentários'}</span>
            </div>

            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6 md:gap-10 items-center pb-6 border-b border-gray-200">
                    <div class="text-center md:text-left">
                        <div class="text-5xl font-bold text-gray-800 leading-none tabular-nums">${media.toFixed(1)}</div>
                        <div class="mt-2 flex justify-center md:justify-start gap-0.5">${estrelaMediaHTML(media, 'w-5 h-5')}</div>
                        <div class="text-sm text-gray-500 mt-2">${total} ${total === 1 ? 'avaliação' : 'avaliações'}</div>
                    </div>
                    <div class="flex-1 w-full space-y-1.5">
                        ${barrasHtml}
                    </div>
                </div>

                <div class="mt-6">
                    ${cardsHtml}
                </div>
            </div>
        </div>

        <script>
        (function() {
            if (window.__responderFeriadosInit) return;
            window.__responderFeriadosInit = true;

            function getSitekey() {
                var el = document.querySelector('.cf-turnstile[data-sitekey]');
                return el ? el.dataset.sitekey : '';
            }

            function buildRespostaForm(idPai) {
                var sitekey = getSitekey();
                var turnstileHtml = sitekey
                    ? '<div class="cf-turnstile mt-3" data-sitekey="' + sitekey + '" data-theme="light"></div><input type="hidden" name="cf-turnstile-response" value="">'
                    : '';
                var labelClass = '${labelClassAvaliacao}';

                return '' +
                    '<form class="resposta-form mt-3 p-3 bg-gray-50 rounded-md border border-gray-200" data-endpoint="/api/comentario-feriados" novalidate>' +
                        '<input type="hidden" name="id" value="' + idPai + '">' +
                        '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
                            '<div class="relative">' +
                                '<input type="text" name="nome" placeholder=" " maxlength="35" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">' +
                                '<label class="' + labelClass + '">Nome <span class="text-red-600">*</span></label>' +
                            '</div>' +
                            '<div class="relative">' +
                                '<input type="email" name="email" placeholder=" " maxlength="200" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">' +
                                '<label class="' + labelClass + '">E-mail <span class="text-red-600">*</span></label>' +
                            '</div>' +
                        '</div>' +
                        '<div class="mt-3 relative">' +
                            '<textarea name="comentario" rows="2" placeholder=" " maxlength="1000" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"></textarea>' +
                            '<label class="' + labelClass + '">Resposta <span class="text-red-600">*</span></label>' +
                        '</div>' +
                        turnstileHtml +
                        '<div data-notificacao-comentario class="hidden mt-3"></div>' +
                        '<div class="flex justify-end gap-2 mt-3">' +
                            '<button type="button" class="cancelar-resposta px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">Cancelar</button>' +
                            '<button type="submit" class="px-3 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-md">Enviar Resposta</button>' +
                        '</div>' +
                    '</form>';
            }

            document.addEventListener('click', function(e) {
                var btn = e.target.closest('.responder-btn');
                if (!btn) return;
                e.preventDefault();

                var id = btn.dataset.comentarioId;
                var article = btn.closest('[data-comentario-id]');
                if (!article) return;
                var container = article.querySelector('.resposta-container');
                if (!container) return;

                if (container.classList.contains('hidden')) {
                    container.classList.remove('hidden');
                    if (!container.dataset.carregado) {
                        container.innerHTML = buildRespostaForm(id);
                        container.dataset.carregado = '1';
                        var form = container.querySelector('.resposta-form');
                        if (form && typeof window.configurarValidacaoComentarioFeriados === 'function') {
                            window.configurarValidacaoComentarioFeriados(form, '/api/comentario-feriados');
                        }
                        var cancelar = container.querySelector('.cancelar-resposta');
                        if (cancelar) {
                            cancelar.addEventListener('click', function(ev) {
                                ev.preventDefault();
                                container.classList.add('hidden');
                            });
                        }
                    }
                } else {
                    container.classList.add('hidden');
                }
            });
        })();
        <\/script>
    `;
}

export function renderFormularioComentario(config) {
    const turnstileAtivo = !!(config.possui_turnstile && config.codigo_sitekey_turnstile);
    const turnstileWidget = turnstileAtivo ? `
        <div class="cf-turnstile mt-4" data-sitekey="${config.codigo_sitekey_turnstile}" data-theme="light"></div>
        <input type="hidden" name="cf-turnstile-response" value="">
    ` : '';

    return `
        <div id="envia_comentarios" class="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-md overflow-hidden">
            <div class="titulo_secao bg-primary px-5 py-2.5 rounded-t-md">
                <h3 class="text-sm font-semibold text-white uppercase tracking-wider">DEIXE UM COMENTÁRIO</h3>
            </div>
            <div class="p-4">
                <form method="POST" id="formularioDeComentario" data-endpoint="/api/comentario-feriados" class="mt-2" novalidate>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="relative">
                            <input type="text" id="nome" name="nome" placeholder=" " maxlength="35" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            <label for="nome" class="${labelClassAvaliacao}">Nome <span class="text-red-600">*</span></label>
                        </div>
                        <div class="relative">
                            <input type="email" id="email" name="email" placeholder=" " maxlength="200" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                            <label for="email" class="${labelClassAvaliacao}">E-mail <span class="text-red-600">*</span></label>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div class="relative">
                            <select id="sexo" name="sexo" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                                <option value="" disabled selected hidden>Selecione</option>
                                <option value="1">Feminino</option>
                                <option value="2">Masculino</option>
                            </select>
                            <label for="sexo" class="${labelSelectClassAvaliacao}">Sexo <span class="text-red-600">*</span></label>
                        </div>
                        <div class="relative">
                            <select id="avaliacao" name="avaliacao" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                                <option value="" disabled selected hidden>Selecione</option>
                                <option value="1">1 - Muito ruim</option>
                                <option value="2">2 - Ruim</option>
                                <option value="3">3 - Regular</option>
                                <option value="4">4 - Bom</option>
                                <option value="5">5 - Excelente</option>
                            </select>
                            <label for="avaliacao" class="${labelSelectClassAvaliacao}">Avaliação <span class="text-red-600">*</span></label>
                        </div>
                    </div>

                    <div class="mt-4 relative">
                        <textarea id="mensagem" name="comentario" rows="4" placeholder=" " maxlength="1000" class="block px-2.5 pb-2 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"></textarea>
                        <label for="mensagem" class="${labelSelectClassAvaliacao}">Comentário <span class="text-red-600">*</span></label>
                    </div>

                    ${turnstileWidget}

                    <div data-notificacao-comentario class="hidden mt-4"></div>

                    <input type="hidden" name="id" id="id" value="0" />
                    <button type="submit" id="envia_comentario" class="mt-4 w-full bg-botao-acao hover:brightness-110 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer border-0">ENVIAR</button>
                </form>
            </div>
        </div>
    `;
}

export function renderScriptsTurnstile(config) {
    const ativo = !!(config.possui_turnstile && config.codigo_sitekey_turnstile);

    const turnstileTag = ativo
        ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>'
        : '';

    return `
        ${turnstileTag}
        <script src="/assets/js/validador-comentario-feriados.js" defer></script>
    `;
}