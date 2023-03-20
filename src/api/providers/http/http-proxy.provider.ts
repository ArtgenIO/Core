import CORSPlugin from '@fastify/cors';
import FormBodyPlugin from '@fastify/formbody';
import { ILogger, Logger, Provider, Service } from '@hisorange/kernel';
import { randomUUID } from 'crypto';
import fastify, { FastifyInstance } from 'fastify';

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
      genReqId: () => randomUUID(),
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
          // nullable: true,
        },
      },
    });
    this.logger.debug('Initialized');

    if (0) await proxy.register(CORSPlugin);
    await proxy.register(FormBodyPlugin);
    this.logger.debug('Plugin [CORS] registered');

    return proxy;
  }
}
