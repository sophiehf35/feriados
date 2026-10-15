// functions/api/comentario-unidades.ts

import { validarTurnstile } from '@sophiehf35/plataforma-base';
import { obterCliente, obterConfigPortal } from '../utils/central.js';

const TIPOS_VALIDOS = ['agencia', 'locker'];

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extrairGeo(request: Request) {
  const cf: any = (request as any).cf || {};

  return {
    ip:
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null,
    pais: cf.country || request.headers.get('cf-ipcountry') || null,
    estado: cf.region || null,
    cidade: cf.city || null,
  };
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    const requestClone = request.clone();
    const body = await request.json();

    const {
      id_pagina,
      tipo_pagina,
      nome,
      email,
      comentario,
      sexo,
      avaliacao,
      id_comentario_pai,
    } = body || {};

    const config = await obterConfigPortal(env);
    if (config.possui_turnstile && config.secret_key_turnstile) {
      const resultado = await validarTurnstile(requestClone, config.secret_key_turnstile);
      if (!resultado.ok) return json({ success: false, error: resultado.erro }, 400);
    }

    if (!id_pagina || !tipo_pagina || !nome || !email || !comentario) {
      return json({ success: false, error: 'Campos obrigatórios' }, 400);
    }
    if (!TIPOS_VALIDOS.includes(tipo_pagina)) {
      return json({ success: false, error: 'Tipo de página inválido' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return json({ success: false, error: 'E-mail inválido' }, 400);
    }
    if (String(comentario).trim().length < 10) {
      return json({ success: false, error: 'Comentário muito curto' }, 400);
    }

    const geo = extrairGeo(request);

    const supabase = await obterCliente(env);
    const { data, error } = await supabase
      .from('comentarios_paginas_correios')
      .insert({
        id_pagina: parseInt(id_pagina),
        tipo_pagina,
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        comentario: String(comentario).trim(),
        sexo: sexo || '',
        avaliacao: parseInt(avaliacao) || 0,
        id_comentario_pai: parseInt(id_comentario_pai) || 0,
        ip: geo.ip,
        pais: geo.pais,
        estado: geo.estado,
        cidade: geo.cidade,
        aprovado: 0,
      })
      .select();

    if (error) {
      console.error('[Comentário Correios] Supabase:', error);
      return json({ success: false, error: 'Erro ao salvar comentário' }, 500);
    }

    return json({ success: true, data });
  } catch (err) {
    console.error('[Comentário Correios]', err);
    return json({ success: false, error: 'Erro interno' }, 500);
  }
};