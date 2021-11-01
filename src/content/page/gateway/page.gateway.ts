import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import TemplateEngine from 'nunjucks';
import { dirname, join } from 'path';
import pov from 'point-of-view';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class PageGateway implements IHttpGateway {
  constructor(
    @Logger('PageGateway')
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    await httpServer.register(pov, {
      engine: {
        nunjucks: TemplateEngine,
      },
      root: join(ROOT_DIR, 'page'),
      defaultContext: {
        PID: process.pid,
      },
    });
    this.logger.info('Plugin [PoV] registered');

    httpServer.get(
      '/',
      async (req: FastifyRequest, res: FastifyReply): Promise<string> => {
        const indexPath = join(
          ROOT_DIR,
          'template/nightglow/storefront/index.html',
        );

        return res.sendFile('index.html', dirname(indexPath));
      },
    );
    this.logger.info('Page [Home] registered at [GET][/]');
  }
}
