import { Authenticator } from '@fastify/passport';
import { Inject, Provider, Service } from '@hisorange/kernel';
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { STRATEGY_CONFIG } from '../../library/strategy.config';

@Service()
export class AuthenticationHandlerProvider
  implements Provider<RouteHandlerMethod>
{
  constructor(
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
  ) {}

  value() {
    return this.authenticator.authenticate(
      ['jwt', 'token'],
      STRATEGY_CONFIG,
      async (
        request: FastifyRequest,
        reply: FastifyReply,
        err: null | Error,
        user?: unknown,
        info?: unknown,
        statuses?: (number | undefined)[],
      ) => {
        if (!user) {
          reply.statusCode = 401;
          reply.send({
            error: 'Unauthorized',
            statusCode: 401,
          });
        }
      },
    );
  }
}
