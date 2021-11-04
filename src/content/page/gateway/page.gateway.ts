import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import TemplateEngine from 'nunjucks';
import { join } from 'path';
import pov from 'point-of-view';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { PageService } from '../service/page.service';

@Service({
  tags: 'http:gateway',
})
export class PageGateway implements IHttpGateway {
  constructor(
    @Logger('PageGateway')
    readonly logger: ILogger,
    @Inject('classes.PageService')
    readonly service: PageService,
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

    for (const page of await this.service.loadRoutes()) {
      httpServer.get(
        page.path,
        async (req: FastifyRequest, res: FastifyReply): Promise<string> => {
          res.header('content-type', 'text/html');
          return this.service.getHtml(page.id);
        },
      );
      this.logger.info(
        'Page [%s] registered at [GET][%s]',
        page.label,
        page.path,
      );
    }
  }
}
