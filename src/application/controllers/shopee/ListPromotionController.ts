import { Controller } from '@application/domain/contracts/Controller';
import type { Promotion } from '@application/entities/Promotion';
import { ListPromotionQuery } from '@infra/database/prisma/query/ListPromotionQuery';
import { Injectable } from '@kermel/decorators/Injectable';

import { listPromotionSchema } from './schemas/listPromotionSchema';

@Injectable()
export class ListPromotionController extends Controller<
  'private',
  ListPromotionController.Response
> {
  constructor(private readonly listPromotionQuery: ListPromotionQuery) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<'private'>): Promise<
    Controller.Response<ListPromotionController.Response>
  > {
    const { page, limit_per_page, search, platform, min_price, max_price, sort_by, sort_order } =
      queryParams as ListPromotionController.Request;

    const queryParamsParsed = listPromotionSchema.parse({
      page,
      limit_per_page,
      search,
      platform,
      min_price,
      max_price,
      sort_by,
      sort_order,
    });

    const { promotions, meta } = await this.listPromotionQuery.execute({
      page: Number(queryParamsParsed.page),
      limitPerPage: Number(queryParamsParsed.limit_per_page),
      search: queryParamsParsed.search,
      platform: queryParamsParsed.platform,
      sortBy: queryParamsParsed.sort_by,
      sortOrder: queryParamsParsed.sort_order,
      minPrice: queryParamsParsed.min_price ? Number(queryParamsParsed.min_price) : undefined,
      maxPrice: queryParamsParsed.max_price ? Number(queryParamsParsed.max_price) : undefined,
    });

    return {
      statusCode: 200,
      body: {
        promotions: promotions.map((promotion: Promotion) => ({
          id: promotion.id!,
          platform: promotion.platform,
          external_id: promotion.externalId,
          title: promotion.title,
          description: promotion.description ?? null,
          category: promotion.category ?? null,
          original_price: promotion.originalPrice ?? null,
          current_price: promotion.currentPrice,
          max_price: promotion.maxPrice ?? null,
          discount_percentage: promotion.discountPercentage ?? null,
          image_url: promotion.imageUrl,
          affiliate_url: promotion.affiliateUrl,
          original_product_url: promotion.originalProductUrl ?? null,
          sales_count: promotion.salesCount,
          rating: promotion.rating,
          commission_amount: promotion.commissionAmount ?? null,
          shop_name: promotion.shopName ?? null,
          created_at: promotion.createdAt ?? null,
          updated_at: promotion.updatedAt ?? null,
        })),
        meta: {
          page_index: meta.pageIndex,
          limit_perPage: meta.limitPerPage,
          count_per_page: meta.countPerPage,
          total_count: meta.totalCount,
        },
      },
    };
  }
}

export namespace ListPromotionController {
  export type Request = {
    page?: string;
    limit_per_page?: string;
    search?: string;
    platform?: string;
    min_price?: string;
    max_price?: string;
    sort_by?: 'sales_count' | 'current_price' | 'discount_percentage' | 'rating' | 'created_at';
    sort_order?: 'asc' | 'desc';
  };

  export type Response = {
    promotions: Array<{
      id: string;
      platform: string;
      external_id: string;
      title: string;
      description: string | null;
      category: string | null;
      original_price: number | null;
      current_price: number;
      max_price: number | null;
      discount_percentage: number | null;
      image_url: string;
      affiliate_url: string;
      original_product_url: string | null;
      sales_count: number;
      rating: number;
      commission_amount: number | null;
      shop_name: string | null;
      created_at: Date | null;
      updated_at: Date | null;
    }>;
    meta: {
      page_index: number;
      limit_perPage: number;
      count_per_page: number;
      total_count: number;
    };
  };
}
