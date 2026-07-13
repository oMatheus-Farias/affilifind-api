import { z } from 'zod';

export const listPromotionSchema = z.object({
  page: z.string().optional(),
  limit_per_page: z.string().optional(),
  search: z.string().optional(),
  platform: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  sort_by: z
    .enum(['sales_count', 'current_price', 'discount_percentage', 'rating', 'created_at'])
    .optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});
