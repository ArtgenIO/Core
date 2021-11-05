import { FastifyInstance } from 'fastify';
import staticMiddleware from 'fastify-static';
import { join } from 'path';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class StaticGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    httpServer.register(staticMiddleware, {
      root: join(ROOT_DIR, 'tassets'),
      prefix: '/assets/',
    });
    this.logger.info('Static directory [/assets] registered');
  }
}
