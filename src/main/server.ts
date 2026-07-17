/* eslint-disable no-console */
import { prismaClient } from '@infra/clients/prismaClient';
import { startTelegramPromotionsScheduler } from '@infra/jobs/telegramPromotionsScheduler';
import { env } from '@shared/config/env';

import { app } from './app';

let telegramPromotionsScheduler: ReturnType<typeof startTelegramPromotionsScheduler> | undefined;

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

        if (env.TELEGRAM_PROMOTIONS_JOB_ENABLED === 'true') {
          telegramPromotionsScheduler = startTelegramPromotionsScheduler();
          console.log(
            `⏱️ Telegram promotions scheduler enabled (${env.TELEGRAM_PROMOTIONS_CRON} @ ${env.TELEGRAM_PROMOTIONS_TIMEZONE}).`,
          );
        }
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
main();

const shutdown = async () => {
  console.log('🛑 Shutting down server...');
  telegramPromotionsScheduler?.stop();
  await app.close();
  await prismaClient.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
