import { Provider } from '@loopback/context';
import fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import formBody from 'fastify-formbody';
import fastifyHttpErrorsEnhanced from 'fastify-http-errors-enhanced';
import fastifySecureSession from 'fastify-secure-session';
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

    // Not used, just here because a library makes a call on it even tho not using it.
    await server.register(fastifySecureSession, {
      key: Buffer.from([
        0x103, 0x132, 0x103, 0x010, 0x200, 0x017, 0x012, 0x345, 0x236, 0x235,
        0x202, 0x247, 0x357, 0x362, 0x074, 0x344, 0x016, 0x246, 0x004, 0x113,
        0x056, 0x000, 0x130, 0x125, 0x234, 0x022, 0x367, 0x210, 0x111, 0x100,
        0x374, 0x037,
      ]),
      cookieName: '__artgen_session',
    });

    return server;
  }
}
