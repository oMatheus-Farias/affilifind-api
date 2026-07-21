import { ErrorCode } from '@application/errors/ErrorCode';
import { runShopeeSyncJob } from '@infra/jobs/shopeeSyncJob';
import { runTelegramPromotionsJob } from '@infra/jobs/telegramPromotionsJob';
import { fastifyErrorResponse } from '@main/utils/fastifyErrorResponse';
import { env } from '@shared/config/env';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

const shopeeSyncBodySchema = z
  .object({
    keywords: z.array(z.string().min(1)).min(1).optional(),
  })
  .optional();

let shopeeSyncRunning = false;
let telegramPromotionsRunning = false;

function isCronAuthorized(request: FastifyRequest) {
  const secret = request.headers['x-cron-secret'];

  if (typeof secret !== 'string' || secret !== env.CRON_JOB_SECRET) {
    return false;
  }

  return true;
}

function denyIfUnauthorized(reply: FastifyReply) {
  return fastifyErrorResponse({
    reply,
    statusCode: 401,
    code: ErrorCode.UNAUTHORIZED,
    message: 'Invalid cron secret',
  });
}

function denyIfRunning(reply: FastifyReply, jobName: string) {
  return fastifyErrorResponse({
    reply,
    statusCode: 409,
    code: ErrorCode.CONFLICT,
    message: `${jobName} already running`,
  });
}

export async function internalRoutes(app: FastifyInstance) {
  const prefix = '/api/v1/internal';

  app.post(`${prefix}/cron/shopee-sync`, async (request, reply) => {
    if (!isCronAuthorized(request)) {
      return denyIfUnauthorized(reply);
    }

    if (shopeeSyncRunning) {
      return denyIfRunning(reply, 'Shopee sync');
    }

    const parsedBody = shopeeSyncBodySchema.safeParse(request.body ?? undefined);

    if (!parsedBody.success) {
      return fastifyErrorResponse({
        reply,
        statusCode: 400,
        code: ErrorCode.VALIDATION,
        message: parsedBody.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    shopeeSyncRunning = true;

    try {
      const result = await runShopeeSyncJob({
        keywords: parsedBody.data?.keywords,
      });

      return reply.status(200).send({
        ok: true,
        message: 'Shopee sync executed successfully.',
        result,
      });
    } catch (error) {
      request.log.error(error, '[Internal Cron] Shopee sync failed');

      return fastifyErrorResponse({
        reply,
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Shopee sync failed',
      });
    } finally {
      shopeeSyncRunning = false;
    }
  });

  app.post(`${prefix}/cron/telegram-promotions`, async (request, reply) => {
    if (!isCronAuthorized(request)) {
      return denyIfUnauthorized(reply);
    }

    if (telegramPromotionsRunning) {
      return denyIfRunning(reply, 'Telegram promotions');
    }

    telegramPromotionsRunning = true;

    try {
      const result = await runTelegramPromotionsJob();

      return reply.status(200).send({
        ok: true,
        message: 'Telegram promotions executed successfully.',
        result,
      });
    } catch (error) {
      request.log.error(error, '[Internal Cron] Telegram promotions failed');

      return fastifyErrorResponse({
        reply,
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Telegram promotions failed',
      });
    } finally {
      telegramPromotionsRunning = false;
    }
  });
}
