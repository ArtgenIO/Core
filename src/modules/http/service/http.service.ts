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
  protected isServerStarted = false;
  protected upstream: FastifyInstance;

  /**
   * Used ports
   */
  protected ports: number[] = [];

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('providers.HttpProxyProvider')
    readonly proxy: FastifyInstance,
    @inject.context()
    readonly ctx: IContext,
  ) {
    this.ports.push(this.getDefaultPort());
  }

  protected getDefaultPort(): number {
    return parseInt(
      process.env.PORT ?? process.env.ARTGEN_HTTP_PORT ?? '7200',
      10,
    );
  }

  async startProxy() {
    this.proxy.all('/*', (req, rep) => {
      rep.statusCode = 500;
      rep.send({
        status: 'degraded',
        uptime: process.uptime(),
      });
    });

    this.proxy.addHook('onRequest', (request, reply, done) => {
      if (this.upstream) {
        this.upstream.routing(request.raw, reply.hijack().raw);
      }

      done();
    });

    const porxyAddr = '0.0.0.0';
    const proxyPort = this.getDefaultPort();

    this.proxy.addHook('onClose', () => {
      this.logger.info('Proxy stopped [%s:%d]', porxyAddr, proxyPort);
    });

    if (process.env.NODE_ENV !== 'test') {
      await this.proxy.listen(proxyPort, porxyAddr);
    }

    this.logger.info('Proxy server listening at [%s:%d]', porxyAddr, proxyPort);
  }

  updateUpstream() {
    this.createUpstream();
  }

  async createUpstream(): Promise<void> {
    const startedAt = Date.now();
    // Refresh the binding
    this.ctx.getBinding('providers.HttpUpstreamProvider').refresh(this.ctx);

    const upstream = await this.ctx.get<FastifyInstance>(
      'providers.HttpUpstreamProvider',
    );

    this.logger.info('Upstream server is starting');
    this.isServerStarted = true;

    await Promise.all(
      this.ctx
        .findByTag('http:gateway')
        .map(async gateway =>
          (await this.ctx.get<IHttpGateway>(gateway.key)).register(upstream),
        ),
    );

    const upstreamAddr = '127.0.0.1';
    const upstreamPort = this.acquirePort();

    upstream.addHook('onClose', () => {
      this.releasePort(upstreamPort);

      this.logger.info('Upstream stopped [%s:%d]', upstreamAddr, upstreamPort);
    });

    upstream.addHook('onReady', () => {
      this.logger.info(
        'Upstream server listening at [%s:%d] build time [%dms]',
        upstreamAddr,
        upstreamPort,
        Date.now() - startedAt,
      );
    });

    upstream.addHook('onTimeout', (req, rep, done) => {
      this.logger.debug('Upstream onTimeout', req.body);
      done();
    });

    if (process.env.NODE_ENV !== 'test') {
      await upstream.listen(upstreamPort, upstreamAddr);
    }

    if (this.upstream) {
      this.upstream.close();
    }

    this.upstream = upstream;
  }

  protected acquirePort(): number {
    let port = this.getDefaultPort();

    while (this.ports.includes(port)) {
      port++;
    }

    this.logger.debug('Port [%d] locked', port);
    this.ports.push(port);

    return port;
  }

  protected releasePort(port: number) {
    this.ports = this.ports.filter(p => p !== port);

    this.logger.debug('Port [%d] unlocked', port);
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
