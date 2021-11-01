import { Provider } from '@loopback/context';
import fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import formBody from 'fastify-formbody';
import swagger from 'fastify-swagger';
import { v4 } from 'uuid';
import { ILogger, Logger, Service } from '../container';

@Service()
export class HttpServerProvider implements Provider<FastifyInstance> {
  constructor(
    @Logger('HttpServerProvider')
    protected readonly logger: ILogger,
  ) {}

  async value(): Promise<FastifyInstance> {
    const server = fastify({
      logger: {
        level: 'warn',
      },
      disableRequestLogging: true,
      genReqId: v4 as () => string,
    });
    this.logger.debug('Initiated');

    await server.register(cors, {
      origin: process.env.NODE_ENV === 'production' ? 'https://artgen.io' : '*',
      credentials: true,
      maxAge: 86400,
      prefix: '/api',
    });
    this.logger.debug('Plugin [CORS] registered');

    await server.register(formBody);
    this.logger.debug('Plugin [FormBody] registered');

    await server.register(swagger, {
      routePrefix: `/swagger`,
      mode: 'dynamic',
      openapi: {
        info: {
          title: 'Artgen CMS',
          description: 'Http Server Documentation',
          version: `RV1`,
          license: {
            name: 'License CC BY-NC-ND 4.0',
            url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
          },
        },
        components: {
          securitySchemes: {
            jwt: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
      uiConfig: {
        displayRequestDuration: true,
      },
      hideUntagged: false,
      exposeRoute: true,
    });
    this.logger.debug('Plugin [Swagger] registered');

    return server;
  }
}
