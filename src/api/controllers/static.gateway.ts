import staticMiddleware from '@fastify/static';
import { ILogger, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { join } from 'path';
import { ROOT_DIR } from '../../paths';
import { IHttpGateway } from '../types/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class StaticGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(upstream: FastifyInstance): Promise<void> {
    upstream.register(staticMiddleware, {
      root: join(ROOT_DIR, 'storage/pages'),
      prefix: '/pages/',
    });
    this.logger.info('Static directory [/pages] registered');
  }
}
