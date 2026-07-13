import { ListPromotionController } from '@application/controllers/shopee/ListPromotionController';
import { SyncShopeeProductsController } from '@application/controllers/shopee/SyncShopeeProductsController';
import { fastifyAdapter } from '@main/adapters/fastifyAdapter';
import type { FastifyInstance } from 'fastify';

export async function shopeeRoutes(app: FastifyInstance) {
  const prefix = '/api/v1/shopee';

  const listPromotionController = fastifyAdapter(ListPromotionController);

  const syncShopeeProductsController = fastifyAdapter(SyncShopeeProductsController);

  app.get(`${prefix}/promotions`, { schema: {} }, listPromotionController);

  app.post(`${prefix}/sync`, { schema: {} }, syncShopeeProductsController);
}
