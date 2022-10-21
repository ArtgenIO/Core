import { ILogger, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import staticMiddleware from 'fastify-static';
import { readFile } from 'fs/promises';
import cloneDeep from 'lodash.clonedeep';
import middie from 'middie';
import { join } from 'path';
import { fileURLToPath } from 'url';
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

            reply.statusCode = 200;
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
      try {
        const dir = join(fileURLToPath(new URL('.', import.meta.url)), '../');

      // eslint-disable-next-line
      const viteConfig = cloneDeep((await import('../vite.config')).default) as any;
      viteConfig.root = join(dir, 'assets');

      const vite = await import('vite');
      this.viteServer = await vite.createServer(viteConfig);
      const middlewares = this.viteServer.middlewares;

      await httpServer.register(middie);
      httpServer.use('/admin', middlewares);

      /* istanbul ignore next */
      if (global.__coverage__) {
        httpServer.get('/__coverage__', (req, res) => {
          res.send(
            JSON.stringify({
              coverage: global.__coverage__ || null,
            }),
          );
        });
      }

      this.logger.info('Vite build [Admin] registered at [GET][/admin]');
      } catch (error) {
        console.error('Could not register the Vite build', error);
        throw error;
      }
    }
  }

  async deregister() {
    if (this.viteServer && this.viteServer?.close) {
      this.logger.debug('Closing the Vite dev server');
      await this.viteServer.close();
    }
  }
}
