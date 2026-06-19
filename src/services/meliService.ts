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

  // 3. Busca produtos na API pública do Mercado Livre usando uma palavra-chave
  async searchProducts(query: string) {
    try {
      // O site do Brasil é o MLB
      const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search`, {
        params: {
          q: query,
          limit: 5, // Vamos puxar só 5 itens para o teste ficar limpo no JSON
        },
        headers: {
          'User-Agent': 'AffiliFind-App/1.0.0 (node-axios)',
        },
      });

      // Retorna a lista de resultados filtrada com o que nos interessa
      return response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        original_price: item.original_price, // Útil para calcular o % de desconto
        permalink: item.permalink,
        thumbnail: item.thumbnail,
        condition: item.condition,
      }));
    } catch (error: any) {
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      throw new Error(`Erro ao buscar produtos: ${errorDetail}`, { cause: error });
    }
  },
};
