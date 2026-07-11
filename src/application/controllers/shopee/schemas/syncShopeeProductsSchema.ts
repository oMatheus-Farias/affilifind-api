import { z } from 'zod';

export const syncShopeeProductsSchema = z.object({
  keyword: z.string("'keyword' query parameter must be a string"),
});
