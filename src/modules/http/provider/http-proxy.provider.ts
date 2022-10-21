import { ILogger, Logger, Provider, Service } from '@hisorange/kernel';
import fastify, { FastifyInstance } from 'fastify';
import CORSPlugin from 'fastify-cors';
import { v4 } from 'uuid';

@Service()
export class HttpProxyProvider implements Provider<FastifyInstance> {
  constructor(
    @Logger()
    protected readonly logger: ILogger,
  ) {}

  async value(): Promise<FastifyInstance> {
    const proxy = fastify({
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
      ajv: {
        customOptions: {
          useDefaults: false,
          coerceTypes: true,
          nullable: true,
        },
      },
    });
    this.logger.debug('Initialized');

    await proxy.register(CORSPlugin);
    this.logger.debug('Plugin [CORS] registered');

    return proxy;
  }
}
