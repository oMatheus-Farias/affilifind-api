import { env } from '@shared/config/env.js';

const CLIENT_ID = env.MELI_CLIENT_ID;
const REDIRECT_URI = encodeURIComponent(env.MELI_REDIRECT_URI ?? '');

export const meliService = {
  // 1. Gera o link que você vai clicar no navegador para dar "Permitir"
  getAuthorizationUrl() {
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  },

  // 2. Troca o código que o Mercado Livre te dá pelo Token de Acesso real
  async exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID ?? '',
      client_secret: env.MELI_CLIENT_SECRET ?? '',
      code: code,
      redirect_uri: env.MELI_REDIRECT_URI ?? '',
    });

    const response = await fetch('https://api.mercadolivre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao obter token: ${JSON.stringify(errorData)}`);
    }

    return response.json(); // Aqui vem o access_token e o refresh_token
  },
};
