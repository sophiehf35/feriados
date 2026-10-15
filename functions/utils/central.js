// functions/utils/central.js

import { decryptData } from '../../scripts/crypto.js';
import { criarClienteSupabase } from '@sophiehf35/plataforma-base/functions/utils/supabase';

export async function obterConfigPortal(env, forceRefresh = false) {
  const { PORTAL_ID, TOKEN_DE_ACESSO, CHAVE_DE_ACESSO, CENTRAL_URL } = env;
  if (!PORTAL_ID || !TOKEN_DE_ACESSO || !CHAVE_DE_ACESSO || !CENTRAL_URL) {
    throw new Error('Configuração do portal incompleta.');
  }

  const response = await fetch(`${CENTRAL_URL}/api/portais/info?id=${PORTAL_ID}`, {
    headers: { 'X-Portal-Token': TOKEN_DE_ACESSO }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar configuração: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Erro na resposta do central');
  }

  const dados = await decryptData(result.encrypted, CHAVE_DE_ACESSO);
  if (!dados.supabase_url || !dados.supabase_key) {
    throw new Error('Configuração do portal não contém credenciais do Supabase.');
  }

  return dados;
}

export async function getSupabaseClient(env) {
  const config = await obterConfigPortal(env);
  return criarClienteSupabase(config.supabase_url, config.supabase_key);
}

export async function obterCliente(env) {
  const config = await obterConfigPortal(env);
  return criarClienteSupabase(config.supabase_url, config.supabase_key);
}