import staticMiddleware from '@fastify/static';
import { ILogger, Logger, Service } from '@hisorange/kernel';
import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import cloneDeep from 'lodash.clonedeep';
import middie from 'middie';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { IHttpGateway } from '../../api/types/http-gateway.interface';
import { ROOT_DIR } from '../../paths';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

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
      await this.registerLiveStaticServer(httpServer);
    } else {
      await this.registerViteDevServer(httpServer);
    }
  }

  protected async registerLiveStaticServer(httpServer: FastifyInstance) {
    // Static files
    const baseDirectory = join(ROOT_DIR, 'storage/pages/admin/');
    const indexBuffer = await readFile(join(baseDirectory, 'index.html'));

    await httpServer.register(
      async (instance, options, done) => {
        // Serve the assets
        await instance.register(staticMiddleware, {
          root: baseDirectory,
          prefix: '/',
          decorateReply: false,
          logLevel: 'error',
        });
        this.logger.info('Static directory [/admin] registered');

        instance.setNotFoundHandler((req, reply) => {
          this.logger.debug('Serving the index on 404 of [%s]', req.url);

          reply.statusCode = 200;
          reply.headers({
            'content-type': 'text/html',
          });
          reply.send(indexBuffer);
        });
      },
      {
        prefix: '/admin',
      },
    );
    this.logger.info('Page [Admin] registered at [GET][/admin]');
  }

  protected async registerViteDevServer(httpServer: FastifyInstance) {
    try {
      // eslint-disable-next-line
      const viteConfig = cloneDeep((await import('./vite.config')).default);
      viteConfig.root = __dirname;

      const vite = await import('vite');
      this.viteServer = await vite.createServer(viteConfig);
      const middlewares = this.viteServer.middlewares;

      await httpServer.register(middie);
      httpServer.use('/admin', middlewares);

      this.logger.info('Vite build [Admin] registered at [GET][/admin]');
    } catch (error) {
      console.error('Could not register the Vite build', error);
      throw error;
    }
  }

  async deregister() {
    if (this.viteServer && this.viteServer?.close) {
      this.logger.debug('Closing the Vite dev server');
      await this.viteServer.close();
    }
  }
}
