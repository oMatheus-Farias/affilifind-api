/* eslint-disable no-console */
import { env } from '@shared/config/env.js';

import { app } from './app.js';

async function main() {
  try {
    const PORT = Number(env.PORT) ?? 3333;

    await app
      .listen({
        host: '0.0.0.0',
        port: PORT,
      })
      .then(() => {
        console.log(`🟢 HTTP server running on http://localhost:${PORT}`);
        console.log(`📚 Swagger docs running on http://localhost:${PORT}/docs`);
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
main();
