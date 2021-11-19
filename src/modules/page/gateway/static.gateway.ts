import { FastifyInstance } from 'fastify';
import staticMiddleware from 'fastify-static';
import { join } from 'path';
import { ILogger, Logger, Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';

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
      root: join(ROOT_DIR, 'assets'),
      prefix: '/assets/',
    });
    this.logger.info('Static directory [/assets] registered');
  }
}
