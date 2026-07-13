import type { Promotion } from '@application/entities/Promotion';
import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';
import type { Prisma } from 'generated/prisma/client';

@Injectable()
export class ListPromotionQuery {
  async execute(input: ListPromotionQuery.Input): Promise<ListPromotionQuery.Output> {
    const { page, limitPerPage, search, platform, minPrice, maxPrice, sortBy, sortOrder } =
      input || {};

    const whereClause: Prisma.PromotionWhereInput = {};

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (platform) {
      whereClause.platform = platform;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.currentPrice = {};
      if (minPrice !== undefined) {
        whereClause.currentPrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.currentPrice.lte = maxPrice;
      }
    }

    const sortingMap: Record<string, string> = {
      sales_count: 'salesCount',
      current_price: 'currentPrice',
      discount_percentage: 'discountPercentage',
      rating: 'rating',
      created_at: 'createdAt',
    };

    const prismaSortKey = sortingMap[sortBy || 'sales_count'] || 'salesCount';

    const [promotions, totalCount] = await Promise.all([
      prismaClient.promotion.findMany({
        where: whereClause,
        skip: (Number(page) - 1) * Number(limitPerPage) || 0,
        take: Number(limitPerPage) || 20,
        orderBy: {
          [prismaSortKey]: sortOrder,
        },
      }),
      prismaClient.promotion.count({
        where: whereClause,
      }),
    ]);

    return {
      promotions,
      meta: {
        pageIndex: Number(page - 1) || 0,
        limitPerPage: Number(limitPerPage) || 20,
        countPerPage: promotions.length,
        totalCount,
      },
    };
  }
}

export namespace ListPromotionQuery {
  export type Input = {
    page: number;
    limitPerPage: number;
    search?: string | undefined;
    platform?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sortBy:
      | 'sales_count'
      | 'current_price'
      | 'discount_percentage'
      | 'rating'
      | 'created_at'
      | undefined;
    sortOrder: 'asc' | 'desc' | undefined;
  };

  export type Output = {
    promotions: Promotion[];
    meta: {
      pageIndex: number;
      limitPerPage: number;
      countPerPage: number;
      totalCount: number;
    };
  };
}
