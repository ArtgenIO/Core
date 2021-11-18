import { inject } from '@loopback/context';
import { FastifyInstance } from 'fastify';
import { IHttpGateway } from '..';
import { IContext, ILogger, Inject, Logger, Service } from '../../container';

@Service()
export class ServerService {
  protected isHttpStarted = false;

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('providers.HttpServerProvider')
    protected httpServer: FastifyInstance,
    @inject.context()
    readonly ctx: IContext,
  ) {}

  async startHttpServer(): Promise<void> {
    let stopPromise: any = null;

    if (this.isHttpStarted) {
      const oldServer = this.httpServer;
      this.ctx.getBinding('providers.HttpServerProvider').refresh(this.ctx);
      this.httpServer = await this.ctx.get('providers.HttpServerProvider');

      this.logger.info('Stopping the HTTP server...');
      stopPromise = oldServer.close();
    }

    this.logger.info('HTTP server is starting');

    await Promise.all(
      this.ctx
        .findByTag('http:gateway')
        .map(async gateway =>
          (
            await this.ctx.get<IHttpGateway>(gateway.key)
          ).register(this.httpServer),
        ),
    );

    let port = parseInt(process.env.ARTGEN_HTTP_PORT, 10);

    // Heroku patch
    if (process.env.PORT) {
      port = parseInt(process.env.PORT, 10);
    }

    if (stopPromise) {
      await stopPromise;
      this.logger.info('HTTP server is stopped');
    }

    if (process.env.NODE_ENV !== 'test') {
      await this.httpServer.listen(port, '0.0.0.0');
    }

    this.isHttpStarted = true;

    this.logger.info('HTTP server listening at [0.0.0.0:%d]', port);
  }
}
