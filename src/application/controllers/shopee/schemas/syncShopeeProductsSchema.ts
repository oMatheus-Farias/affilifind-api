import { z } from 'zod';

export const syncShopeeProductsSchema = z.object({
  keywords: z.array(z.string(), "'keywords' query parameter must be a array of strings").optional(),
});

export type SyncShopeeProductsBody = z.infer<typeof syncShopeeProductsSchema>;
