import { Provider } from '@loopback/context';
import fastify, { FastifyInstance } from 'fastify';
import auth from 'fastify-auth';
import cors from 'fastify-cors';
import formBody from 'fastify-formbody';
import fastifyHttpErrorsEnhanced from 'fastify-http-errors-enhanced';
import swagger from 'fastify-swagger';
import { v4 } from 'uuid';
import { ILogger, Logger, Service } from '../container';

@Service()
export class HttpServerProvider implements Provider<FastifyInstance> {
  constructor(
    @Logger()
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

    await server.register(auth);
    this.logger.debug('Plugin [Authentication] registered');

    await server.register(swagger, {
      routePrefix: `/swagger`,
      mode: 'dynamic',
      openapi: {
        info: {
          title: 'Artgen API',
          description: 'Http Server Documentation',
          version: `RV1`,
        },
        components: {
          securitySchemes: {
            jwt: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
        tags: [
          {
            name: 'OData',
            description: 'OData backed endpoints',
          },
          {
            name: 'Rest',
            description: 'Rest structured endpoints',
          },
          {
            name: 'Workflow',
            description: 'Workflow defined HTTP triggers',
          },
        ],
      },
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

    await server.register(fastifyHttpErrorsEnhanced);

    return server;
  }
}
