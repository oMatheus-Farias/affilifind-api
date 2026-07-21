import { GetDynamicKeywordsQuery } from '@infra/database/prisma/query/GetDynamicKeywordsQuery';
import { PromotionRepository } from '@infra/database/prisma/repositories/PromotionRepository';
import { ShopeeGateway } from '@infra/gateways/ShopeeGateway';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SyncShopeeProductsUseCase {
  constructor(
    private readonly shopeeGateway: ShopeeGateway,
    private readonly promotionRepository: PromotionRepository,
    private readonly getDynamicKeywordsQuery: GetDynamicKeywordsQuery,
  ) {}

  async execute(
    input?: SyncShopeeProductsUseCase.Input,
  ): Promise<SyncShopeeProductsUseCase.Output> {
    let searchTargets: Array<{ keyword: string; category: string }>;

    if (input?.keywords && input.keywords.length > 0) {
      // Se enviado manualmente, associa uma categoria padrão "geral"
      searchTargets = input.keywords.map((kw) => ({ keyword: kw, category: 'geral' }));
    } else {
      const { keywords } = await this.getDynamicKeywordsQuery.execute({
        limit: 6,
        keywordsPerCategory: 2,
      });
      searchTargets = keywords;
    }

    // Fallback estático caso o banco esteja vazio
    if (searchTargets.length === 0) {
      searchTargets = [
        { keyword: 'organizador casa', category: 'casa' },
        { keyword: 'celular', category: 'tech' },
        { keyword: 'maquiagem', category: 'beleza' },
        { keyword: 'garrafa termica', category: 'gadgets' },
        { keyword: 'oculos escuros', category: 'moda' },
        { keyword: 'brinquedo pet', category: 'outros' },
        { keyword: 'teclado mecanico', category: 'tech' },
        { keyword: 'achados tiktok', category: 'gadgets' },
        { keyword: 'necessaire viagem', category: 'outros' },
      ];
    }

    let totalReceived = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const allSavedProducts: ShopeeGateway.Output[] = [];
    const processedExternalIds = new Set<string>();

    for (const target of searchTargets) {
      const { keyword, category } = target;
      const strategyRandomizer = Math.random() > 0.5;
      const listType = strategyRandomizer ? 2 : 1;
      const strategyName = listType === 2 ? 'Top Performance' : 'Maior Comissão';

      // eslint-disable-next-line no-console
      console.log(`[Sync Shopee] Varrendo: "${keyword}" (Cat: ${category}) via [${strategyName}]`);

      try {
        const foundProducts = await this.shopeeGateway.searchPromotions({
          keyword,
          limit: 20,
          listType,
          sortType: 2,
        });

        totalReceived += foundProducts.length;

        for (const product of foundProducts) {
          const rating = product.rating ? Number(product.rating) : 0;
          const salesCount = product.sales_count ? Number(product.sales_count) : 0;

          if (rating < 4.7 || salesCount < 100) {
            continue;
          }

          if (!product.affiliate_url) {
            // eslint-disable-next-line no-console
            console.log(
              `[Sync Shopee] Ignorando "${product.title}" porque a API não retornou link de afiliado.`,
            );
            continue;
          }

          if (processedExternalIds.has(product.external_id)) {
            continue;
          }

          processedExternalIds.add(product.external_id);
          allSavedProducts.push(product);

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
              category,
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
              category,
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

        if (searchTargets.indexOf(target) < searchTargets.length - 1) {
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
      foundProducts: allSavedProducts,
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
    foundProducts: ShopeeGateway.Output[];
    summary: {
      itemsReceivedFromApi: number;
      itemsCreatedInDb: number;
      itemsUpdatedInDb: number;
    };
  };
}
