import { prismaClient } from '@infra/clients/prismaClient';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SendPromotionsToChannelsUseCase {
  async execute(): Promise<SendPromotionsToChannelsUseCase.Output> {
    // 1. Busca produtos não enviados
    const pendingPromotions = await prismaClient.promotion.findMany({
      where: { sentAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingPromotions.length === 0) {
      return { sentCount: 0, message: 'Nenhuma promoção pendente para envio.', products: [] };
    }

    // 2. Agrupa os produtos diretamente por seu campo nativo de categoria
    const promotionsByCategory: Record<string, typeof pendingPromotions> = {};

    for (const promotion of pendingPromotions) {
      const category = promotion.category || 'outros';

      if (!promotionsByCategory[category]) {
        promotionsByCategory[category] = [];
      }
      promotionsByCategory[category].push(promotion);
    }

    // 3. Seleciona apenas 1 produto por categoria de forma aleatória até atingir 10
    const selectedPromotions: typeof pendingPromotions = [];
    const categories = Object.keys(promotionsByCategory).sort(() => Math.random() - 0.5);

    for (const category of categories) {
      if (selectedPromotions.length >= 10) {
        break;
      }

      const productsInCategories = promotionsByCategory[category];

      if (productsInCategories && productsInCategories.length > 0) {
        const randomIndex = Math.floor(Math.random() * productsInCategories.length);
        const randomProduct = productsInCategories[randomIndex];

        if (randomProduct) {
          selectedPromotions.push(randomProduct);
        }
      }
    }

    const sentIds: string[] = [];

    for (const promotion of selectedPromotions) {
      // eslint-disable-next-line no-console
      console.log(
        `📢 [Disparo Canal] [Cat: ${promotion.category}] Enviando: "${promotion.title}" | R$ ${promotion.currentPrice}`,
      );
      sentIds.push(promotion.id);
    }

    if (sentIds.length > 0) {
      await prismaClient.promotion.updateMany({
        where: { id: { in: sentIds } },
        data: { sentAt: new Date() },
      });
    }

    return {
      sentCount: selectedPromotions.length,
      message: `${selectedPromotions.length} achadinhos de categorias diferentes foram disparados com sucesso.`,
      products: selectedPromotions.map((product) => ({
        id: product.id,
        title: product.title,
        currentPrice: product.currentPrice,
        imageUrl: product.imageUrl,
        affiliateUrl: product.affiliateUrl,
        category: product.category || 'outros',
      })),
    };
  }
}

export namespace SendPromotionsToChannelsUseCase {
  export type Output = {
    sentCount: number;
    message: string;
    products: Array<{
      id: string;
      title: string;
      currentPrice: number;
      imageUrl: string;
      affiliateUrl: string;
      category: string;
    }>;
  };
}
