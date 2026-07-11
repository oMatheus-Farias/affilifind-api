import { PromotionRepository } from '@infra/database/prisma/repositories/PromotionRepository';
import { ShopeeGateway } from '@infra/gateways/ShopeeGateway';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SyncShopeeProductsUseCase {
  constructor(
    private readonly shopeeGateway: ShopeeGateway,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(
    input?: SyncShopeeProductsUseCase.Input,
  ): Promise<SyncShopeeProductsUseCase.Output> {
    // Se não enviar keywords, usa uma lista padrão abrangente de alto volume
    const keywords =
      input?.keywords && input.keywords.length > 0
        ? input.keywords
        : [
            'celular',
            'fone bluetooth',
            'maquiagem',
            'relogio smart',
            'organizador casa',
            'cozinha',
          ];

    let totalReceived = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const allFoundProducts: any[] = [];

    for (const keyword of keywords) {
      // eslint-disable-next-line no-console
      console.log(`[Sync Shopee] Iniciando varredura para o termo: "${keyword}"`);

      try {
        const foundProducts = await this.shopeeGateway.searchPromotions({ keyword });

        totalReceived += foundProducts.length;
        allFoundProducts.push(...foundProducts);

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

        if (keywords.indexOf(keyword) < keywords.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(
          `❌ [Sync Shopee] Falha ao processar a palavra-chave "${keyword}":`,
          error.message,
        );

        throw error;
      }
    }

    return {
      foundProducts: allFoundProducts,
      summary: {
        itemsReceivedFromApi: totalReceived,
        itemsCreatedInDb: createdCount,
        itemsUpdatedInDb: updatedCount,
      },
    };
  }
}

export namespace SyncShopeeProductsUseCase {
  export type Input = {
    keywords?: string[] | undefined;
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
