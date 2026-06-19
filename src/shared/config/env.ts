import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('3333'),
  DATABASE_URL: z.string(),
  MELI_REDIRECT_URI: z.url(),
  MELI_CLIENT_ID: z.string(),
  MELI_CLIENT_SECRET: z.string(),
  TEMPORARY_MELI_ACCESS_TOKEN: z.string(),
});

export const env = schema.parse(process.env);
