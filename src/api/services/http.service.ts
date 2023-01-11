import { IContext, ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { inject } from '@loopback/context';
import { FastifyInstance } from 'fastify';
import { HttpUpstreamProvider } from '../providers/http/http-upstream.provider';
import { BucketKey } from '../types/bucket-key.enum';
import { IHttpGateway } from '../types/http-gateway.interface';
import { TelemetryService } from './telemetry.service';

@Service()
export class HttpService {
  protected isServerStarted = false;
  protected upstream: FastifyInstance;
  protected upstreamId: number = 0;
  protected bootstrapped = false;

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('providers.HttpProxyProvider')
    readonly proxy: FastifyInstance,
    @inject.context()
    readonly ctx: IContext,
    @Inject(TelemetryService)
    readonly telemetry: TelemetryService,
  ) {}

  protected getDefaultPort(): number {
    return parseInt(
      process.env.PORT ?? process.env.ARTGEN_HTTP_PORT ?? '7200',
      10,
    );
  }

  async startProxy() {
    this.proxy.all('/*', (req, rep) => {
      rep.statusCode = 500;
      rep.header('refresh', 2);
      rep.send({
        status: 'degraded',
        uptime: process.uptime(),
      });
    });

    this.proxy.addHook('onRequest', (request, reply, done) => {
      if (this.upstream) {
        if (!request.url.match(/@fs|\/admin/)) {
          this.logger.debug(
            'Proxy [%s][%s][%s]',
            request.method,
            request.hostname,
            request.url,
          );
        }

        this.upstream.routing(request.raw, reply.hijack().raw);
      }

      this.telemetry.record(BucketKey.HTTP_REQUEST);

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

  /**
   * Update the upstream server
   */
  async updateUpstream() {
    // Only propagate when the first upstream is online.
    if (this.bootstrapped) {
      await this.createUpstream();
    }
  }

  async createUpstream(): Promise<void> {
    const startedAt = Date.now();
    const id = ++this.upstreamId;
    // Refresh the binding
    this.ctx
      .getBinding('providers.' + HttpUpstreamProvider.name)
      .refresh(this.ctx);

    const upstream = await this.ctx.get<FastifyInstance>(
      'providers.' + HttpUpstreamProvider.name,
    );

    this.logger.info('Upstream [%s] starting', id);

    await Promise.all(
      this.ctx
        .findByTag('http:gateway')
        .map(async gateway =>
          (await this.ctx.get<IHttpGateway>(gateway.key)).register(upstream),
        ),
    );

    upstream.addHook('onClose', () => {
      this.logger.info('Downstream [%s] closed', id);
    });

    upstream.addHook('onReady', () => {
      this.logger.info(
        'Upstream [%s] ready, prepared in [%d] ms',
        id,
        Date.now() - startedAt,
      );
    });

    if (process.env.NODE_ENV !== 'test') {
      await upstream.listen(0);
    }

    // Existing downstream
    if (this.upstream) {
      this.upstream.close();
    }

    // Swap reference
    this.upstream = upstream;

    // First upstream is ready.
    if (!this.bootstrapped) {
      this.bootstrapped = true;
    }
  }

  async stopServer() {
    await Promise.all(
      this.ctx.findByTag('http:gateway').map(async gateway => {
        const instance = await this.ctx.get<IHttpGateway>(gateway.key);

        if (instance?.deregister) {
          await instance
            .deregister()
            .catch(e => this.logger.warn((e as Error)?.message));
        }
      }),
    );

    if (this.upstream) {
      await this.upstream.close();
    }

    if (this.proxy) {
      await this.proxy.close();
    }
  }
}
