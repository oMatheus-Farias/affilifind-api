import { prismaClient } from '@infra/clients/prismaClient';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ShopeeGateway } from 'src/gateways/ShopeeGateway';

const shopeeGateway = new ShopeeGateway();

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/sync/test-shopee
   * Single endpoint to validate authentication, "Achadinhos" scraping, and Supabase storage via Prisma.
   * Usage: http://localhost:3000/api/sync/test-shopee?appId=YOUR_APP_ID&secret=YOUR_SECRET_KEY&keyword=phone
   */
  fastify.get('/api/sync/test-shopee', async (request: FastifyRequest, reply: FastifyReply) => {
    const { appId, secret, keyword } = request.query as {
      appId?: string;
      secret?: string;
      keyword?: string;
    };

    if (!appId || !secret) {
      return reply.status(400).send({
        error: 'Missing credentials',
        message:
          'Please provide both appId and secret via query params. Example: ?appId=123&secret=abc',
      });
    }

    const searchKeyword = keyword || 'makeup';

    try {
      // 1. Fetch products from Shopee API Affiliate Gateway
      const foundProducts = await shopeeGateway.searchPromotions({
        keyword: searchKeyword,
        appId,
        secret,
      });

      let createdCount = 0;
      let updatedCount = 0;

      // 2. Sync products with database using Prisma upsert
      for (const product of foundProducts) {
        // Check if item already exists to determine if it's an update or creation
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
          where: {
            externalId: product.externalId,
          },
          update: {
            title: product.title,
            currentPrice: product.currentPrice,
            imageUrl: product.imageUrl,
            affiliateUrl: product.affiliateUrl,
            updatedAt: new Date(),
          },
          create: {
            platform: product.platform,
            externalId: product.externalId,
            title: product.title,
            currentPrice: product.currentPrice,
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage,
            imageUrl: product.imageUrl,
            affiliateUrl: product.affiliateUrl,
          },
        });
      }

      // 3. Respond with structural feedback
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
