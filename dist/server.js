// src/shared/config/env.ts
import { z } from 'zod';
var schema = z.object({
  PORT: z.string().default('3333'),
  DATABASE_URL: z.string(),
  MELI_REDIRECT_URI: z.url(),
  MELI_CLIENT_ID: z.string(),
  MELI_CLIENT_SECRET: z.string(),
});
var env = schema.parse(process.env);

// src/main/app.ts
import { fastify } from 'fastify';

// src/services/meliService.ts
var CLIENT_ID = env.MELI_CLIENT_ID;
var REDIRECT_URI = encodeURIComponent(env.MELI_REDIRECT_URI ?? '');
var meliService = {
  // 1. Gera o link que você vai clicar no navegador para dar "Permitir"
  getAuthorizationUrl() {
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  },
  // 2. Troca o código que o Mercado Livre te dá pelo Token de Acesso real
  async exchangeCodeForToken(code) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID ?? '',
      client_secret: env.MELI_CLIENT_SECRET ?? '',
      code,
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
    return response.json();
  },
};

// src/routes/authRoutes.ts
async function authRoutes(fastify2) {
  fastify2.get('/api/auth/meli', async (request, reply) => {
    try {
      const authUrl = meliService.getAuthorizationUrl();
      return reply.status(200).send({
        message: 'Clique no link abaixo para autorizar a aplica\xE7\xE3o no Mercado Livre:',
        url: authUrl,
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
  fastify2.get('/api/auth/callback/meli', async (request, reply) => {
    const { code } = request.query;
    if (!code) {
      return reply
        .status(400)
        .send({ error: 'C\xF3digo de autoriza\xE7\xE3o n\xE3o fornecido pelo Mercado Livre.' });
    }
    try {
      const tokenData = await meliService.exchangeCodeForToken(code);
      return reply.status(200).send({
        message: 'Autentica\xE7\xE3o realizada com sucesso!',
        data: tokenData,
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Falha ao trocar o c\xF3digo pelo token de acesso.',
        details: error.message,
      });
    }
  });
}

// src/main/app.ts
var app = fastify({ logger: true });
app.get('/', async () => {
  return { message: '\u{1F7E2} OK' };
});
app.register(authRoutes);

// src/main/server.ts
async function main() {
  try {
    const PORT = Number(env.PORT) ?? 3333;
    await app
      .listen({
        host: '0.0.0.0',
        port: PORT,
      })
      .then(() => {
        console.log(`\u{1F7E2} HTTP server running on http://localhost:${PORT}`);
        console.log(`\u{1F4DA} Swagger docs running on http://localhost:${PORT}/docs`);
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
main();
