import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SendPromotionsToChannelsUseCase {
  async execute(): Promise<SendPromotionsToChannelsUseCase.Output> {
    const pendingPromotions = await prismaClient.promotion.findMany({
      where: { sentAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const eligiblePromotions = pendingPromotions.filter((promotion) => {
      if (!promotion.affiliateUrl) {
        return false;
      }

      if (promotion.originalProductUrl && promotion.affiliateUrl === promotion.originalProductUrl) {
        return false;
      }

      return true;
    });

    if (eligiblePromotions.length === 0) {
      return {
        message:
          pendingPromotions.length === 0
            ? 'Nenhuma promoção pendente para envio.'
            : 'Nenhuma promoção pendente com link de afiliado válido para envio.',
        products: [],
        promotionIds: [],
        summary: {
          itemsReceivedFromDb: pendingPromotions.length,
          itemsSelectedForChannel: 0,
        },
      };
    }

    const promotionsByCategory: Record<string, typeof eligiblePromotions> = {};

    for (const promotion of eligiblePromotions) {
      const category = promotion.category || 'outros';

      if (!promotionsByCategory[category]) {
        promotionsByCategory[category] = [];
      }

      promotionsByCategory[category].push(promotion);
    }

    const selectedPromotions: typeof eligiblePromotions = [];
    const categories = Object.keys(promotionsByCategory).sort(() => Math.random() - 0.5);

    for (const category of categories) {
      if (selectedPromotions.length >= 10) {
        break;
      }

      const productsInCategory = promotionsByCategory[category];

      if (!productsInCategory || productsInCategory.length === 0) {
        continue;
      }

      const randomIndex = Math.floor(Math.random() * productsInCategory.length);
      const randomProduct = productsInCategory[randomIndex];

      if (randomProduct) {
        selectedPromotions.push(randomProduct);
      }
    }

    return {
      message: `${selectedPromotions.length} achadinhos de categorias diferentes foram preparados para envio.`,
      products: selectedPromotions.map((product) => ({
        id: product.id,
        title: product.title,
        currentPrice: product.currentPrice,
        maxPrice: product.maxPrice,
        discountPercentage: product.discountPercentage,
        imageUrl: product.imageUrl,
        affiliateUrl: product.affiliateUrl,
        originalProductUrl: product.originalProductUrl,
        category: product.category || 'outros',
        salesCount: product.salesCount,
        rating: product.rating,
      })),
      promotionIds: selectedPromotions.map((promotion) => promotion.id),
      summary: {
        itemsReceivedFromDb: pendingPromotions.length,
        itemsSelectedForChannel: selectedPromotions.length,
      },
    };
  }
}

export namespace SendPromotionsToChannelsUseCase {
  export type Output = {
    message: string;
    products: Array<{
      id: string;
      title: string;
      currentPrice: number;
      maxPrice: number | null;
      discountPercentage: number | null;
      imageUrl: string;
      affiliateUrl: string;
      originalProductUrl: string | null;
      category: string;
      salesCount: number;
      rating: number;
    }>;
    promotionIds: string[];
    summary: {
      itemsReceivedFromDb: number;
      itemsSelectedForChannel: number;
    };
  };
}
