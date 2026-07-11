import { PromotionRepository } from '@infra/database/prisma/repositories/PromotionRepository';
import { ShopeeGateway } from '@infra/gateways/ShopeeGateway';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SyncShopeeProductsUseCase {
  constructor(
    private readonly shopeeGateway: ShopeeGateway,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute({
    keyword,
  }: SyncShopeeProductsUseCase.Input): Promise<SyncShopeeProductsUseCase.Output> {
    const foundProducts = await this.shopeeGateway.searchPromotions({
      keyword,
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const product of foundProducts) {
      const existingPromotion = await this.promotionRepository.findByExternalId({
        externalId: product.external_id,
      });

      if (existingPromotion) {
        updatedCount++;
      } else {
        createdCount++;
      }

      await this.promotionRepository.upsert({
        externalId: product.external_id,
        update: {
          title: product.title,
          currentPrice: product.current_price,
          maxPrice: product.max_price,
          discountPercentage: product.discount_percentage,
          imageUrl: product.image_url,
          affiliateUrl: product.affiliate_url,
          originalProductUrl: product.original_product_url,
          salesCount: product.sales_count,
          rating: product.rating,
          commissionAmount: product.commission_amount,
          shopName: product.shop_name,
        },
        create: {
          platform: product.platform,
          title: product.title,
          currentPrice: product.current_price,
          maxPrice: product.max_price,
          originalPrice: null,
          discountPercentage: product.discount_percentage,
          imageUrl: product.image_url,
          affiliateUrl: product.affiliate_url,
          originalProductUrl: product.original_product_url,
          salesCount: product.sales_count,
          rating: product.rating,
          commissionAmount: product.commission_amount,
          shopName: product.shop_name,
        },
      });
    }

    return {
      foundProducts,
      summary: {
        itemsReceivedFromApi: foundProducts.length,
        itemsCreatedInDb: createdCount,
        itemsUpdatedInDb: updatedCount,
      },
    };
  }
}

export namespace SyncShopeeProductsUseCase {
  export type Input = {
    keyword: string;
  };

  export type Output = {
    foundProducts: any[];
    summary: {
      itemsReceivedFromApi: number;
      itemsCreatedInDb: number;
      itemsUpdatedInDb: number;
    };
  };
}
