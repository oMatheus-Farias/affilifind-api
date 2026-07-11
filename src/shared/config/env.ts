import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('3333'),
  // Database
  DATABASE_URL: z.string(),

  // Shopee
  SHOPEE_API_URL: z.url(),
  SHOPEE_APP_ID: z.string(),
  SHOPEE_SECRET: z.string(),
});

export const env = schema.parse(process.env);
