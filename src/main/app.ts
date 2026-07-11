import 'reflect-metadata';

import { fastify } from 'fastify';
import { authRoutes } from 'src/routes/authRoutes';

export const app = fastify({ logger: true });

app.get('/', async () => {
  return { message: '🟢 OK' };
});

app.register(authRoutes);
