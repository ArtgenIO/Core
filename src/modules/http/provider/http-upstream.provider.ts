import { Provider } from '@loopback/context';
import fastify, { FastifyInstance } from 'fastify';
import FormBodyPlugin from 'fastify-formbody';
import FastifyHttpErrorsEnhancedPlugin from 'fastify-http-errors-enhanced';
import FastifySecureSessionPlugin from 'fastify-secure-session';
import OpenAPIPlugin from 'fastify-swagger';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { OpenApiService } from '../../rest/service/openapi.service';

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
      logger: {
        level: 'warn',
      },
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

    await server.register(OpenAPIPlugin, {
      routePrefix: '/api/docs',
      mode: 'dynamic',
      openapi: await this.openApiSvc.getDocument(),
      uiConfig: {
        displayRequestDuration: true,
        docExpansion: 'none',
        syntaxHighlight: {
          theme: 'monokai',
        },
      },
      hideUntagged: false,
      exposeRoute: true,
    });
    this.logger.debug('Plugin [Swagger] registered');

    await server.register(FastifyHttpErrorsEnhancedPlugin);

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
        getErrorMessage(error),
      );

      done();
    });

    return server;
  }
}
