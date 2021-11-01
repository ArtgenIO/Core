import { FastifyInstance } from 'fastify';
import { Service } from '../container';
import { IHttpGateway } from '../server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class DevelopGateway implements IHttpGateway {
  async register(httpServer: FastifyInstance): Promise<void> {
    // Not available in production environment
    if (process.env.NODE_ENV === 'production') return;

    httpServer.get(
      '/$develop/routes',
      {
        schema: {
          tags: ['$develop'],
        },
      },
      async () =>
        httpServer.printRoutes({
          includeMeta: false,
        }),
    );
  }
}
