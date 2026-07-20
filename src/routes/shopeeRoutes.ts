import { ListPromotionController } from '@application/controllers/shopee/ListPromotionController';
import { fastifyAdapter } from '@main/adapters/fastifyAdapter';
import type { FastifyInstance } from 'fastify';

export async function shopeeRoutes(app: FastifyInstance) {
  const prefix = '/api/v1/shopee';

  const listPromotionController = fastifyAdapter(ListPromotionController);

  app.get(`${prefix}/promotions`, { schema: {} }, listPromotionController);
}
