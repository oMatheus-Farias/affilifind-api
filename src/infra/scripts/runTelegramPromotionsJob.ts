import 'reflect-metadata';

import { prismaClient } from '@infra/clients/prismaClient';
import { runTelegramPromotionsJob } from '@infra/jobs/telegramPromotionsJob';

async function main() {
  try {
    await runTelegramPromotionsJob();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Telegram Job] Failed to dispatch promotions:', error);
    process.exitCode = 1;
  } finally {
    await prismaClient.$disconnect();
  }
}

main();
