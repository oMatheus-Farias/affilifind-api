import { env } from '@shared/config/env.js';
import axios from 'axios';

const CLIENT_ID = env.MELI_CLIENT_ID;
const REDIRECT_URI = encodeURIComponent(env.MELI_REDIRECT_URI ?? '');

export const meliService = {
  // 1. Gera o link que você vai clicar no navegador para dar "Permitir"
  getAuthorizationUrl() {
    return `https://auth.mercadolibre.com/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
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

    try {
      const { data } = await axios.post(
        'https://api.mercadolibre.com/oauth/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // O Mercado Livre exige um User-Agent válido para não derrubar a requisição
            'User-Agent': 'AffiliFind-App/1.0.0 (node-axios)',
          },
        },
      );

      return data;
    } catch (error: any) {
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      throw new Error(`Erro na chamada da API: ${errorDetail}`, { cause: error });
    }
  },

  async searchProducts(query: string, accessToken: string) {
    try {
      const response = await axios.get(`https://api.mercadolibre.com/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'AffiliFind-App/1.0.0 (node-axios)',
        },
      });

      return [
        {
          id: response.data.id,
          title: `Conta Ativa: ${response.data.nickname}`,
          price: 0,
          original_price: 0,
          permalink: response.data.site_status,
          thumbnail: '',
          condition: 'active',
        },
      ];
    } catch (error: any) {
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      throw new Error(`Erro ao validar token com /users/me: ${errorDetail}`, { cause: error });
    }
  },
};
