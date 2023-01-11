import FormBodyPlugin from '@fastify/formbody';
import FastifySecureSessionPlugin from '@fastify/secure-session';
import fastifySwaggerApi from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { ILogger, Inject, Logger, Provider, Service } from '@hisorange/kernel';
import fastify, { FastifyInstance } from 'fastify';
import FastifyHttpErrorsEnhancedPlugin from 'fastify-http-errors-enhanced';
import { v4 } from 'uuid';
import { OpenApiService } from '../../services/openapi.service';

@Service()
export class HttpUpstreamProvider implements Provider<FastifyInstance> {
  constructor(
    @Logger()
    protected readonly logger: ILogger,
    @Inject(OpenApiService)
    protected openApiSvc: OpenApiService,
  ) {}

  async value(): Promise<FastifyInstance> {
    const server = fastify({
      // logger: this.logger.child({ scope: 'http.upstream' }),
      disableRequestLogging: true,
      genReqId: v4 as () => string,
      trustProxy: true,
      ignoreTrailingSlash: true,
      bodyLimit: 100 * 1024 * 1024,
      keepAliveTimeout: 3_000,
      connectionTimeout: 3_000,
      pluginTimeout: 2_000,
    });
    this.logger.debug('Initiated');

    await server.register(FormBodyPlugin);
    this.logger.debug('Plugin [FormBody] registered');

    await server.register(fastifySwaggerApi, {
      openapi: this.openApiSvc.getDocument(),
      mode: 'dynamic',
      hideUntagged: false,
    });

    await server.register(fastifySwaggerUi, {
      routePrefix: '/swagger',
      uiConfig: {
        displayRequestDuration: true,
        docExpansion: 'none',
        syntaxHighlight: {
          theme: 'monokai',
        },
      },
    });
    this.logger.debug('Plugin [Swagger] registered');

    await server.register(FastifyHttpErrorsEnhancedPlugin, {
      hideUnhandledErrors: false,
    });

    // Not used, just here because a library makes a call on it even tho not using it.
    await server.register(FastifySecureSessionPlugin, {
      key: Buffer.from([
        0x103, 0x132, 0x103, 0x010, 0x200, 0x017, 0x012, 0x345, 0x236, 0x235,
        0x202, 0x247, 0x357, 0x362, 0x074, 0x344, 0x016, 0x246, 0x004, 0x113,
        0x056, 0x000, 0x130, 0x125, 0x234, 0x022, 0x367, 0x210, 0x111, 0x100,
        0x374, 0x037,
      ]),
      cookieName: '__artgen_session',
    });

    server.addHook('onError', (req, rep, error, done) => {
      this.logger.error(
        'Request [%s][%s] error [%s]',
        req.method,
        req.url,
        (error as Error)?.message,
      );

      done();
    });

    return server;
  }
}
