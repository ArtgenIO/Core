import { FastifyInstance } from 'fastify';
import staticMiddleware from 'fastify-static';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ILogger, Logger, Service } from '../../../app/container';
import { ROOT_DIR } from '../../../app/globals';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';

@Service({
  tags: 'http:gateway',
})
export class AdminGateway implements IHttpGateway {
  protected viteServer: any;

  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      // Static files
      const STATIC_DIR = join(ROOT_DIR, 'storage/views/admin/assets/');
      const INDEX_BUFFER = await readFile(join(STATIC_DIR, '../index.html'));

      // Serve the assets
      await httpServer.register(staticMiddleware, {
        root: STATIC_DIR,
        prefix: '/admin/assets/',
        decorateReply: false,
      });
      this.logger.info('Static directory [/admin] registered');

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
          prefix: '/admin',
        },
      );
      this.logger.info('Page [Admin] registered at [GET][/admin]');
    } else {
      const dir = join(__dirname, '../');

      // eslint-disable-next-line
      const viteConfig = require(join(dir, 'vite.config.js'));
      viteConfig.root = join(dir, 'assets');

      // eslint-disable-next-line
      const vite = require('vite');
      this.viteServer = await vite.createServer(viteConfig);
      // eslint-disable-next-line
      const middie = import('middie');

      await httpServer.register(middie);
      httpServer.use('/admin', this.viteServer.middlewares);

      this.logger.info('Vite build [Admin] registered at [GET][/admin]');
    }
  }

  async deregister() {
    if (this.viteServer) {
      if (this.viteServer?.close) {
        this.logger.debug('Closing the Vite dev server');
        await this.viteServer.close();
      }
    }
  }
}
