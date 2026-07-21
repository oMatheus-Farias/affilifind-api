import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('3333'),
  // Database
  DATABASE_URL: z.string(),

  // Internal cron access
  CRON_JOB_SECRET: z.string().min(1),

  // Shopee
  SHOPEE_API_URL: z.url(),
  SHOPEE_APP_ID: z.string(),
  SHOPEE_SECRET: z.string(),

  // Shopee sync
  SHOPEE_SYNC_JOB_ENABLED: z.string().default('false'),
  SHOPEE_SYNC_CRON: z.string().default('15 */2 * * *'),
  SHOPEE_SYNC_TIMEZONE: z.string().default('America/Sao_Paulo'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHANNEL_CHAT_ID: z.string(),
  TELEGRAM_API_URL: z.url().default('https://api.telegram.org'),
  TELEGRAM_PROMOTIONS_JOB_ENABLED: z.string().default('false'),
  TELEGRAM_PROMOTIONS_CRON: z.string().default('0 */2 * * *'),
  TELEGRAM_PROMOTIONS_TIMEZONE: z.string().default('America/Sao_Paulo'),
});

export const env = schema.parse(process.env);
