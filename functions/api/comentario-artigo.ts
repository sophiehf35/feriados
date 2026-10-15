// functions/api/comentario-artigo.ts

import { criarHandlerComentario } from '@sophiehf35/plataforma-base';
import { obterCliente, obterConfigPortal } from '../utils/central.js';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    // Clona o request para que o handler possa ler o corpo novamente
    const requestClone = request.clone();
    const body = await request.json();
    const turnstileToken = body['cf-turnstile-response'];
    console.log('[API Comentário] Token recebido:', turnstileToken ? turnstileToken.substring(0, 20) + '...' : 'vazio');

    const config = await obterConfigPortal(env);
    console.log('[API Comentário] Config Turnstile:', {
      possui: config.possui_turnstile,
      temSecret: !!config.secret_key_turnstile,
      sitekey: config.codigo_sitekey_turnstile
    });

    // Se Turnstile está ativo, valida o token obrigatoriamente
    if (config.possui_turnstile && config.secret_key_turnstile) {
      if (!turnstileToken || turnstileToken.length < 20) {
        console.warn('[API Comentário] Token ausente ou muito curto.');
        return new Response(
          JSON.stringify({ success: false, error: 'Verificação de segurança incompleta.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('[API Comentário] Chamando siteverify...');
      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${config.secret_key_turnstile}&response=${turnstileToken}`,
      });
      const verifyResult: any = await verifyResponse.json();
      console.log('[API Comentário] Resultado siteverify:', verifyResult);

      if (!verifyResult.success) {
        console.warn('[API Comentário] Falha na verificação Turnstile.');
        return new Response(
          JSON.stringify({ success: false, error: 'Falha na verificação de segurança.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('[API Comentário] Turnstile desativado ou secret não configurado, pulando validação.');
    }

    // Passa o request clone para o handler, assim ele pode ler o corpo sem conflito
    const handler = criarHandlerComentario(obterCliente);
    return handler({ ...context, request: requestClone });
  } catch (err) {
    console.error('[API Comentário] Erro interno:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};