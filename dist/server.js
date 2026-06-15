// src/shared/config/env.ts
import { z } from 'zod';
var schema = z.object({
  PORT: z.string().default('3333'),
  DATABASE_URL: z.string(),
});
var env = schema.parse(process.env);

// src/main/app.ts
import { fastify } from 'fastify';
var app = fastify();
app.get('/', async () => {
  return { message: '\u{1F7E2} OK' };
});

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
