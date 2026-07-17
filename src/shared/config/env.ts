import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('3333'),
  // Database
  DATABASE_URL: z.string(),

  // Shopee
  SHOPEE_API_URL: z.url(),
  SHOPEE_APP_ID: z.string(),
  SHOPEE_SECRET: z.string(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHANNEL_CHAT_ID: z.string(),
  TELEGRAM_API_URL: z.url().default('https://api.telegram.org'),
  TELEGRAM_PROMOTIONS_JOB_ENABLED: z.string().default('false'),
  TELEGRAM_PROMOTIONS_CRON: z.string().default('0 */2 * * *'),
  TELEGRAM_PROMOTIONS_TIMEZONE: z.string().default('America/Sao_Paulo'),
});

export const env = schema.parse(process.env);
