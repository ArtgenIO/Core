import { inject } from '@loopback/context';
import { FastifyInstance } from 'fastify';
import {
  IContext,
  ILogger,
  Inject,
  Logger,
  Service,
} from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { IHttpGateway } from '../interface/http-gateway.interface';

@Service()
export class HttpService {
  protected isHttpStarted = false;

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('providers.HttpServerProvider')
    protected httpServer: FastifyInstance,
    @inject.context()
    readonly ctx: IContext,
  ) {}

  updateServer() {
    if (this.isHttpStarted) {
      this.startServer();
    }
  }

  async startServer(): Promise<void> {
    let stopPromise: any = null;

    if (this.isHttpStarted) {
      const oldServer = this.httpServer;
      this.ctx.getBinding('providers.HttpServerProvider').refresh(this.ctx);
      this.httpServer = await this.ctx.get('providers.HttpServerProvider');

      this.logger.info('Stopping the HTTP server...');
      stopPromise = oldServer.close();
    }

    this.logger.info('HTTP server is starting');
    this.isHttpStarted = true;

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

    this.logger.info('HTTP server listening at [0.0.0.0:%d]', port);
  }

  async stopServer() {
    await Promise.all(
      this.ctx.findByTag('http:gateway').map(async gateway => {
        const instance = await this.ctx.get<IHttpGateway>(gateway.key);

        if (instance?.deregister) {
          await instance
            .deregister()
            .catch(e => this.logger.warn(getErrorMessage(e)));
        }
      }),
    );
  }
}
