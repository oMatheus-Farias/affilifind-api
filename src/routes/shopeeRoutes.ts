import { SyncShopeeProductsController } from '@application/controllers/shopee/SyncShopeeProductsController';
import { fastifyAdapter } from '@main/adapters/fastifyAdapter';
import type { FastifyInstance } from 'fastify';

export async function shopeeRoutes(app: FastifyInstance) {
  const prefix = '/api/v1/shopee';

  const syncShopeeProductsController = fastifyAdapter(SyncShopeeProductsController);

  app.post(`${prefix}/sync`, { schema: {} }, syncShopeeProductsController);
}
