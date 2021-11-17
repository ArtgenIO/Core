import { Provider } from '@loopback/context';
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import { Authenticator } from 'fastify-passport';
import { Inject, Service } from '../../../container';
import { STRATEGY_CONFIG } from '../util/strategy.config';

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
