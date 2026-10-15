// functions/api/fale-conosco.ts

import { criarHandlerContato } from '@sophiehf35/plataforma-base';
import { obterCliente, obterConfigPortal } from '../utils/central.js';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    const requestClone = request.clone();
    const body = await request.json();
    const turnstileToken = body['cf-turnstile-response'];

    const config = await obterConfigPortal(env);

    if (config.possui_turnstile && config.secret_key_turnstile) {
      if (!turnstileToken || turnstileToken.length < 20) {
        return new Response(
          JSON.stringify({ success: false, error: 'Verificação de segurança incompleta.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${config.secret_key_turnstile}&response=${turnstileToken}`,
      });
      const verifyResult: any = await verifyResponse.json();
      if (!verifyResult.success) {
        return new Response(
          JSON.stringify({ success: false, error: 'Falha na verificação de segurança.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const handler = criarHandlerContato(obterCliente);
    return handler({ ...context, request: requestClone });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};