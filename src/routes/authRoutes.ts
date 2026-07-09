import { prismaClient } from '@infra/clients/prismaClient';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { ShopeeGateway } from '../gateways/ShopeeGateway.js';

const shopeeGateway = new ShopeeGateway();

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/sync/test-shopee
   * Realiza a busca ao vivo na API de Afiliados da Shopee e sincroniza com o banco via Prisma Upsert
   */
  fastify.get('/api/sync/test-shopee', async (request: FastifyRequest, reply: FastifyReply) => {
    const { keyword } = request.query as { keyword?: string };
    const searchKeyword = keyword || 'makeup';

    try {
      const foundProducts = await shopeeGateway.searchPromotions({
        keyword: searchKeyword,
      });

      let createdCount = 0;
      let updatedCount = 0;

      for (const product of foundProducts) {
        const existingPromotion = await prismaClient.promotion.findUnique({
          where: { externalId: product.externalId },
          select: { id: true },
        });

        if (existingPromotion) {
          updatedCount++;
        } else {
          createdCount++;
        }

        await prismaClient.promotion.upsert({
          where: { externalId: product.externalId },
          update: {
            title: product.title,
            currentPrice: product.currentPrice,
            maxPrice: product.maxPrice,
            discountPercentage: product.discountPercentage,
            imageUrl: product.imageUrl,
            affiliateUrl: product.affiliateUrl,
            originalProductUrl: product.originalProductUrl,
            salesCount: product.salesCount,
            rating: product.rating,
            commissionAmount: product.commissionAmount,
            shopName: product.shopName,
            updatedAt: new Date(),
          },
          create: {
            platform: product.platform,
            externalId: product.externalId,
            title: product.title,
            currentPrice: product.currentPrice,
            maxPrice: product.maxPrice,
            originalPrice: null,
            discountPercentage: product.discountPercentage,
            imageUrl: product.imageUrl,
            affiliateUrl: product.affiliateUrl,
            originalProductUrl: product.originalProductUrl,
            salesCount: product.salesCount,
            rating: product.rating,
            commissionAmount: product.commissionAmount,
            shopName: product.shopName,
          },
        });
      }

      return reply.status(200).send({
        success: true,
        message: `Sync executed successfully for keyword: "${searchKeyword}"`,
        summary: {
          itemsReceivedFromApi: foundProducts.length,
          itemsCreatedInDb: createdCount,
          itemsUpdatedInDb: updatedCount,
        },
        items: foundProducts,
      });
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Failed to execute Shopee integrated sync test.',
        details: error.message,
      });
    }
  });
}
