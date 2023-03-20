import pov from '@fastify/view';
import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import TemplateEngine from 'nunjucks';
import { join } from 'path';
import { ROOT_DIR } from '../../paths';
import { KeyValueService } from '../services/key-value.service';
import { PageService } from '../services/page.service';
import { IHttpGateway } from '../types/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class PageGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(PageService)
    readonly pageService: PageService,
    @Inject(KeyValueService)
    readonly kv: KeyValueService,
  ) {}

  async register(upstream: FastifyInstance): Promise<void> {
    await upstream.register(pov, {
      engine: {
        nunjucks: TemplateEngine,
      },
      root: join(ROOT_DIR, 'page'),
      defaultContext: {
        PID: process.pid,
      },
    });
    this.logger.debug('Plugin [PoV] registered');

    const routes = await this.pageService.loadRoutes();
    const constraints: { host?: string } = {};

    const host = await this.kv.get(
      'artgen.http.host',
      process.env.ARTGEN_HTTP_HOST +
        (process.env.ARTGEN_HTTP_PORT == '80'
          ? ''
          : `:${process.env.ARTGEN_HTTP_PORT}`),
    );

    if (host) {
      constraints.host = host;
    }

    for (const page of routes) {
      upstream.get(
        '/' + page.path.replace(/^\//, ''),
        { constraints },
        async (req: FastifyRequest, res: FastifyReply): Promise<string> => {
          res.header('content-type', 'text/html');
          return this.pageService.getHtml(page.id);
        },
      );
      this.logger.info(
        'Page [%s] registered at [GET][/%s]',
        page.title,
        page.path,
      );
    }
  }
}
