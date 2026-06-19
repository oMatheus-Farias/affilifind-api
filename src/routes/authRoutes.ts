import { env } from '@shared/config/env.js';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { meliService } from 'src/services/meliService.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Rota 1: GET /api/auth/meli
  // Cospe o link oficial do Mercado Livre para você clicar e autorizar o app
  fastify.get('/api/auth/meli', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authUrl = meliService.getAuthorizationUrl();

      return reply.status(200).send({
        message: 'Clique no link abaixo para autorizar a aplicação no Mercado Livre:',
        url: authUrl,
      });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Rota 2: GET /api/auth/callback/meli
  // O Mercado Livre vai redirecionar para cá trazendo o "?code=XXXX" na URL
  fastify.get('/api/auth/callback/meli', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply
        .status(400)
        .send({ error: 'Código de autorização não fornecido pelo Mercado Livre.' });
    }

    try {
      // Troca o código temporário pelo Access Token e Refresh Token reais
      const tokenData = await meliService.exchangeCodeForToken(code);

      // Por enquanto, vamos apenas cuspir o token na tela para validar que funcionou.
      // No futuro, salvaremos esses dados com segurança no Supabase.
      return reply.status(200).send({
        message: 'Autenticação realizada com sucesso!',
        data: tokenData,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Falha ao trocar o código pelo token de acesso.',
        details: error.message,
      });
    }
  });

  // Rota 3: GET /api/sync/test-meli
  // Dispara uma busca real para testar a extração de dados
  fastify.get('/api/sync/test-meli', async (request: FastifyRequest, reply: FastifyReply) => {
    const TOKEN_TEMPORARIO = env.TEMPORARY_MELI_ACCESS_TOKEN;

    try {
      // Vamos buscar por "Playstation 5" como teste
      const produtos = await meliService.searchProducts('Playstation 5', TOKEN_TEMPORARIO);

      return reply.status(200).send({
        success: true,
        total_items: produtos.length,
        items: produtos,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Falha ao buscar produtos no Mercado Livre.',
        details: error.message,
      });
    }
  });
}
