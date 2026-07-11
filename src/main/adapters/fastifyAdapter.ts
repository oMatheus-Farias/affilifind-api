import type { Controller } from '@application/domain/contracts/Controller';
import { Registry } from '@kermel/di/Registry';
import { fastifyBodyParser } from '@main/utils/fastifyBodyParser';
import type { Constructor } from '@shared/type/Constructor';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function fastifyAdapter<TType extends 'public' | 'private', TBody>(
  controllerImpl: Constructor<Controller<TType, TBody>>,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const controller = Registry.getInstance().resolve(controllerImpl);

    const body = fastifyBodyParser(request.body);
    const params = (request.params ?? {}) as Record<string, unknown>;
    const queryParams = (request.query ?? {}) as Record<string, unknown>;

    const controllerRequest = {
      body,
      params,
      queryParams,
    } as unknown as Controller.Request<TType>;

    const response = await controller.execute(controllerRequest);

    reply.status(response.statusCode).send(response.body);
  };
}
