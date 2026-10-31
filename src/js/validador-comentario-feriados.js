// src/js/validador-comentario-feriados.js

(function () {
    'use strict';

    const ENDPOINT_PADRAO = '/api/comentario-feriados';
    const TEMPO_BARRA_MS = 900;

    function getDadosPagina() {
        const h1 = document.querySelector('h1[data-tipo-pagina]');
        if (!h1) return null;
        return {
            id_pagina: h1.dataset.id,
            tipo_pagina: h1.dataset.tipoPagina,
            ano: h1.dataset.ano || '',
            uf: h1.dataset.uf || '',
            cidade: h1.dataset.cidade || '',
            mes: h1.dataset.mes || '',
        };
    }

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
    }

    function configurarValidacaoComentarioFeriados(seletorForm, endpoint) {
        const form = typeof seletorForm === 'string'
            ? document.querySelector(seletorForm)
            : seletorForm;

        if (!form) return;
        if (form.dataset.comentarioConfigurado === 'true') return;
        form.dataset.comentarioConfigurado = 'true';

        const endpointFinal = endpoint || form.dataset.endpoint || ENDPOINT_PADRAO;

        const botao = form.querySelector('[type="submit"]');
        if (!botao) return;

        const turnstileElement = form.querySelector('.cf-turnstile');
        const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
        const possuiTurnstile = !!turnstileElement;

        let notificacao = form.querySelector('[data-notificacao-comentario]');
        if (!notificacao) {
            notificacao = document.createElement('div');
            notificacao.setAttribute('data-notificacao-comentario', '');
            notificacao.className = 'hidden mt-3';
            form.appendChild(notificacao);
        }

        const marcarErro = (campo) => {
            if (!campo) return;
            campo.classList.add('border-red-500', 'focus:border-red-500');
        };
        const limparErro = (campo) => {
            if (!campo) return;
            campo.classList.remove('border-red-500', 'focus:border-red-500');
        };

        function limparNotificacao() {
            notificacao.classList.add('hidden');
            notificacao.innerHTML = '';
        }

        function exibirNotificacao(mensagem, tipo) {
            tipo = tipo || 'erro';
            const isErro = tipo === 'erro';
            const cor = isErro
                ? 'text-red-800 bg-red-100 border-red-300'
                : 'text-green-800 bg-green-100 border-green-300';
            const titulo = isErro ? 'Atenção!' : 'Sucesso!';

            notificacao.classList.remove('hidden');
            notificacao.innerHTML = `
                <div class="flex items-start p-4 text-sm rounded-md border ${cor}" role="alert">
                    <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-medium mr-1">${titulo}</span> ${mensagem}
                </div>`;

            if (!isErro) {
                setTimeout(limparNotificacao, 5000);
            }
        }

        function criarBarraProgresso(ms) {
            const barra = document.createElement('div');
            barra.className = 'w-full bg-gray-200 rounded-full h-2 mt-3';
            barra.innerHTML = '<div class="bg-blue-700 h-2 rounded-full" style="width:0%; transition: width ' + ms + 'ms linear;"></div>';
            notificacao.parentNode.insertBefore(barra, notificacao);
            const inner = barra.querySelector('.bg-blue-700');
            if (inner) {
                void inner.offsetWidth;
                inner.style.width = '100%';
            }
            return barra;
        }

        form.querySelectorAll('input, textarea, select').forEach((campo) => {
            const handler = () => {
                limparNotificacao();
                limparErro(campo);
            };
            campo.addEventListener('focus', handler);
            campo.addEventListener('input', handler);
            campo.addEventListener('change', handler);
        });

        let turnstileWidgetId = null;
        let enviando = false;

        function renderizarTurnstile() {
            if (!possuiTurnstile || turnstileWidgetId) return;
            if (!window.turnstile) return;
            try {
                turnstileWidgetId = window.turnstile.render(turnstileElement, {
                    sitekey: turnstileElement.dataset.sitekey,
                    callback: (token) => {
                        if (turnstileInput) turnstileInput.value = token;
                    },
                    'expired-callback': () => {
                        if (turnstileInput) turnstileInput.value = '';
                    },
                    'error-callback': () => {},
                });
            } catch (err) {}
        }

        function removerTurnstile() {
            if (turnstileWidgetId && window.turnstile) {
                try { window.turnstile.remove(turnstileWidgetId); } catch (e) {}
            }
            turnstileWidgetId = null;
            if (turnstileInput) turnstileInput.value = '';
        }

        async function validarEEnviar() {
            if (enviando) return;
            limparNotificacao();

            const dadosPagina = getDadosPagina();
            if (!dadosPagina || !dadosPagina.id_pagina || !dadosPagina.tipo_pagina) {
                exibirNotificacao('Não foi possível identificar a página. Recarregue e tente novamente.', 'erro');
                return;
            }

            const nomeEl = form.querySelector('[name="nome"]');
            const emailEl = form.querySelector('[name="email"]');
            const sexoEl = form.querySelector('[name="sexo"]');
            const avaliacaoEl = form.querySelector('[name="avaliacao"]');
            const mensagemEl = form.querySelector('[name="comentario"]');
            const idPaiEl = form.querySelector('[name="id"]');

            const nome = (nomeEl?.value || '').trim();
            const email = (emailEl?.value || '').trim();
            const sexo = sexoEl?.value || '';
            const avaliacao = avaliacaoEl?.value || '';
            const comentario = (mensagemEl?.value || '').trim();
            const idComentarioPai = idPaiEl?.value || '0';

            let primeiroErro = null;

            if (!nome) {
                primeiroErro = 'O campo "nome" é obrigatório.';
                marcarErro(nomeEl);
            } else {
                limparErro(nomeEl);
            }

            if (!primeiroErro) {
                if (!email) {
                    primeiroErro = 'O campo "email" é obrigatório.';
                    marcarErro(emailEl);
                } else if (!validarEmail(email)) {
                    primeiroErro = 'E-mail inválido.';
                    marcarErro(emailEl);
                } else {
                    limparErro(emailEl);
                }
            }

            if (!primeiroErro && sexoEl) {
                if (!sexo) {
                    primeiroErro = 'Selecione o seu sexo.';
                    marcarErro(sexoEl);
                } else {
                    limparErro(sexoEl);
                }
            }

            if (!primeiroErro && avaliacaoEl) {
                if (!avaliacao) {
                    primeiroErro = 'Selecione uma nota.';
                    marcarErro(avaliacaoEl);
                } else {
                    limparErro(avaliacaoEl);
                }
            }

            if (!primeiroErro) {
                if (!comentario) {
                    primeiroErro = 'O campo "comentário" é obrigatório.';
                    marcarErro(mensagemEl);
                } else if (comentario.length < 5) {
                    primeiroErro = 'O comentário deve ter pelo menos 5 caracteres.';
                    marcarErro(mensagemEl);
                } else {
                    limparErro(mensagemEl);
                }
            }

            if (primeiroErro) {
                exibirNotificacao(primeiroErro, 'erro');
                return;
            }

            if (possuiTurnstile) {
                const token = turnstileInput?.value || '';
                if (!token || token.length < 20) {
                    renderizarTurnstile();
                    if (turnstileWidgetId && window.turnstile) {
                        window.turnstile.execute(turnstileWidgetId);
                    } else {
                        exibirNotificacao('Erro ao carregar verificação de segurança.', 'erro');
                    }
                    return;
                }
            }

            enviando = true;
            const textoOriginal = botao.textContent;
            botao.disabled = true;
            botao.textContent = 'ENVIANDO...';

            const barra = criarBarraProgresso(TEMPO_BARRA_MS);
            const inicio = Date.now();

            async function aguardarMinimo() {
                const decorrido = Date.now() - inicio;
                const restante = Math.max(0, TEMPO_BARRA_MS - decorrido);
                if (restante > 0) await new Promise((r) => setTimeout(r, restante));
            }

            try {
                const payload = {
                    id_pagina: dadosPagina.id_pagina,
                    tipo_pagina: dadosPagina.tipo_pagina,
                    ano: dadosPagina.ano,
                    uf: dadosPagina.uf,
                    cidade: dadosPagina.cidade,
                    mes: dadosPagina.mes,
                    nome,
                    email,
                    sexo,
                    avaliacao,
                    comentario,
                    id_comentario_pai: idComentarioPai,
                    'cf-turnstile-response': turnstileInput?.value || '',
                };

                const response = await fetch(endpointFinal, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                let result;
                try { result = await response.json(); }
                catch { result = { success: false, error: 'Resposta inválida do servidor' }; }

                await aguardarMinimo();

                if (result.success) {
                    exibirNotificacao('Comentário enviado com sucesso! Aguarde moderação.', 'sucesso');
                    if (nomeEl) nomeEl.value = '';
                    if (emailEl) emailEl.value = '';
                    if (sexoEl) sexoEl.value = '';
                    if (avaliacaoEl) avaliacaoEl.value = '';
                    if (mensagemEl) mensagemEl.value = '';
                    if (idPaiEl) idPaiEl.value = '0';
                    form.querySelectorAll('.border-red-500').forEach(limparErro);
                    removerTurnstile();

                    const container = form.closest('.resposta-container');
                    if (container) {
                        setTimeout(() => { container.classList.add('hidden'); }, 1800);
                    }
                } else {
                    exibirNotificacao(result.error || 'Erro ao enviar comentário.', 'erro');
                    removerTurnstile();
                }
            } catch (err) {
                await aguardarMinimo();
                exibirNotificacao('Não foi possível conectar ao servidor.', 'erro');
                removerTurnstile();
            } finally {
                if (barra && barra.parentNode) barra.parentNode.removeChild(barra);
                enviando = false;
                botao.disabled = false;
                botao.textContent = textoOriginal || 'ENVIAR';
            }
        }

        if (possuiTurnstile) {
            if (window.turnstile) {
                renderizarTurnstile();
            } else {
                const check = setInterval(() => {
                    if (window.turnstile) {
                        clearInterval(check);
                        renderizarTurnstile();
                    }
                }, 200);
                setTimeout(() => clearInterval(check), 5000);
            }
        }

        botao.addEventListener('click', (e) => {
            e.preventDefault();
            validarEEnviar();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            validarEEnviar();
        });
    }

    function init() {
        const form = document.getElementById('formularioDeComentario');
        if (!form) return;
        configurarValidacaoComentarioFeriados(form, form.dataset.endpoint || ENDPOINT_PADRAO);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.configurarValidacaoComentarioFeriados = configurarValidacaoComentarioFeriados;
})();