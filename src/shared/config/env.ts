import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('3333'),
  DATABASE_URL: z.string(),
});

export const env = schema.parse(process.env);
