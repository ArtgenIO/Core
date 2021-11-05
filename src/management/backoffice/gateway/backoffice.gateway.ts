import { FastifyInstance } from 'fastify';
import staticMiddleware from 'fastify-static';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ROOT_DIR } from '../../../paths';
import { ILogger, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class BackOfficeGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      // Static files
      const STATIC_DIR = join(ROOT_DIR, 'storage/views/backoffice/assets/');
      const INDEX_BUFFER = await readFile(join(STATIC_DIR, '../index.html'));

      // Serve the assets
      await httpServer.register(staticMiddleware, {
        root: STATIC_DIR,
        prefix: '/backoffice/assets/',
        decorateReply: false,
      });
      this.logger.info('Static directory [/backoffice] registered');

      await httpServer.register(
        (instance, options, done) => {
          instance.setNotFoundHandler((req, reply) => {
            this.logger.debug('Serving the index on 404 of [%s]', req.url);

            reply.headers({
              'content-type': 'text/html',
            });
            reply.send(INDEX_BUFFER);
          });

          done();
        },
        {
          prefix: '/backoffice',
        },
      );
      this.logger.info('Page [BackOffice] registered at [GET][/backoffice]');
    } else {
      const dir = join(__dirname, '../');

      // eslint-disable-next-line
      const viteConfig = require(join(dir, 'vite.config.js'));
      viteConfig.root = join(dir, 'assets');

      // eslint-disable-next-line
      const vite = require('vite');
      const srv = await vite.createServer(viteConfig);
      // eslint-disable-next-line
      const middie = import('middie');

      await httpServer.register(middie);
      httpServer.use('/backoffice', srv.middlewares);

      this.logger.info(
        'Vite build [BackOffice] registered at [GET][/backoffice]',
      );
    }
  }
}
