import staticMiddleware from '@fastify/static';
import { ILogger, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { join } from 'path';
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
      root: join(ROOT_DIR, 'storage/views'),
      prefix: '/view/',
    });
    this.logger.info('Static directory [/view] registered');
  }
}
