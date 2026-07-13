import type { Promotion } from '@application/entities/Promotion';
import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class PromotionRepository {
  async findByExternalId({ externalId }: { externalId: string }): Promise<Promotion | null> {
    const promotion = await prismaClient.promotion.findUnique({
      where: { externalId },
    });

    if (!promotion) {
      return null;
    }

    return promotion;
  }

  async upsert({ externalId, update, create }: PromotionRepository.UpsertParams): Promise<void> {
    await prismaClient.promotion.upsert({
      where: { externalId },
      update: {
        title: update.title,
        currentPrice: update.currentPrice,
        maxPrice: update.maxPrice,
        discountPercentage: update.discountPercentage,
        imageUrl: update.imageUrl,
        affiliateUrl: update.affiliateUrl,
        originalProductUrl: update.originalProductUrl,
        salesCount: update.salesCount,
        rating: update.rating,
        commissionAmount: update.commissionAmount,
        shopName: update.shopName,
        updatedAt: new Date(),
      },
      create: {
        id: uuidv7(),
        platform: create.platform,
        externalId,
        title: create.title,
        currentPrice: create.currentPrice,
        maxPrice: create.maxPrice,
        originalPrice: null,
        discountPercentage: create.discountPercentage,
        imageUrl: create.imageUrl,
        affiliateUrl: create.affiliateUrl,
        originalProductUrl: create.originalProductUrl,
        salesCount: create.salesCount,
        rating: create.rating,
        commissionAmount: create.commissionAmount,
        shopName: create.shopName,
      },
    });
  }
}

export namespace PromotionRepository {
  export type UpsertParams = {
    externalId: string;
    update: {
      title: string;
      currentPrice: number;
      maxPrice: number | null;
      discountPercentage: number | null;
      imageUrl: string;
      affiliateUrl: string;
      originalProductUrl: string;
      salesCount: number;
      rating: number;
      commissionAmount: number | null;
      shopName: string | null;
    };
    create: {
      platform: string;
      title: string;
      currentPrice: number;
      maxPrice: number | null;
      originalPrice?: number | null;
      discountPercentage: number | null;
      imageUrl: string;
      affiliateUrl: string;
      originalProductUrl: string;
      salesCount: number;
      rating: number;
      commissionAmount: number | null;
      shopName: string | null;
    };
  };
}
