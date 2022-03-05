import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import TemplateEngine from 'nunjucks';
import { join } from 'path';
import pov from 'point-of-view';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';
import { KeyValueService } from '../../schema/service/key-value.service';
import { PageService } from '../service/page.service';

@Service({
  tags: 'http:gateway',
})
export class PageGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(PageService)
    readonly service: PageService,
    @Inject(KeyValueService)
    readonly kv: KeyValueService,
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

    const routes = await this.service.loadRoutes();
    const constraints: { host?: string } = {};

    const host = await this.kv.get(
      'artgen.http.host',
      process.env.ARTGEN_HTTP_HOST +
        (process.env.ARTGEN_HTTP_PORT == '80'
          ? ''
          : `:${process.env.ARTGEN_HTTP_PORT}`),
    );

    if (host && process.env.ARTGEN_DEMO != '1') {
      constraints.host = host;
    }

    this.logger.info('Admin redirection at [GET][%s][/] -> [/admin]', host);

    httpServer.get('/', { constraints }, (req, rep) => {
      rep.redirect('/admin');
    });

    for (const page of routes) {
      httpServer.get(
        '/' + page.path.replace(/^\//, ''),
        { constraints },
        async (req: FastifyRequest, res: FastifyReply): Promise<string> => {
          res.header('content-type', 'text/html');
          return this.service.getHtml(page.id);
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
