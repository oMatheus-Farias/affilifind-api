import 'reflect-metadata';

import { prismaClient } from '@infra/clients/prismaClient';
import { runShopeeSyncJob } from '@infra/jobs/shopeeSyncJob';

function parseKeywords(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const keywords = value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return keywords.length > 0 ? keywords : undefined;
}

async function main() {
  try {
    const result = await runShopeeSyncJob({
      keywords: parseKeywords(process.env.SHOPEE_SYNC_KEYWORDS),
    });

    // eslint-disable-next-line no-console
    console.log(
      `[Shopee Sync Job] finished with ${result.foundProducts.length} promotions ready for the Telegram pool.`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Shopee Sync Job] Failed to sync promotions:', error);
    process.exitCode = 1;
  } finally {
    await prismaClient.$disconnect();
  }
}

main();
