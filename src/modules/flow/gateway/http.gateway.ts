import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
  RouteShorthandOptions,
} from 'fastify';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { IHttpGateway } from '../../http/interface/http-gateway.interface';
import { HttpTriggerConfig } from '../../http/lambda/http-trigger.lambda';
import { AuthenticationHandlerProvider } from '../../identity/provider/authentication-handler.provider';
import { LambdaService } from '../../lambda/service/lambda.service';
import { FlowService } from '../service/flow.service';

@Service({
  tags: 'http:gateway',
})
export class LogicHttpGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(FlowService)
    readonly flowSvc: FlowService,
    @Inject(LambdaService)
    readonly node: LambdaService,
    @Inject(AuthenticationHandlerProvider)
    readonly authHandler: RouteHandlerMethod,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    const preHandler = this.authHandler;

    for (const flow of await this.flowSvc.findAll()) {
      const triggers = flow.nodes.filter(t => t.type === 'trigger.http');

      for (const trigger of triggers) {
        const routeConfig: Partial<HttpTriggerConfig> = {
          path: '/api/webhook/' + trigger.id,
          method: 'GET',
          authentication: 'public',
        };

        if (trigger.config) {
          const triggerConfig = trigger.config as HttpTriggerConfig;

          if (triggerConfig.path) {
            routeConfig.path = triggerConfig.path;
          }

          if (triggerConfig.method) {
            routeConfig.method = triggerConfig.method;
          }

          if (triggerConfig.authentication) {
            routeConfig.authentication = triggerConfig.authentication;
          }
        }

        this.logger.info(
          'WebHook [%s][%s] registered to [%s][%s]',
          flow.id.substring(0, 8),
          trigger.id,
          routeConfig.method,
          routeConfig.path,
        );

        const paramSchema = {
          type: 'object',
          properties: {},
        };

        if (routeConfig.path.match(':')) {
          for (const routeParam of routeConfig.path.matchAll(
            /\:([^\/]+)(\/|$)/g,
          )) {
            paramSchema.properties[routeParam[1]] = {
              type: 'string',
            };
          }
        }

        const swaggerSecurity = [];
        const isProtected = routeConfig.authentication == 'protected';

        if (isProtected) {
          swaggerSecurity.push({
            jwt: [],
            accessKeyQuery: [],
            accessKeyHeader: [],
          });
        }

        const method = routeConfig.method.toLowerCase();
        const options: RouteShorthandOptions = {
          schema: {
            tags: ['Flow'],
            description: `Invokes the [${flow.id}/${trigger.id}] node`,
            params: paramSchema,
            security: swaggerSecurity,
          },
          preHandler: isProtected ? preHandler : null,
        };

        httpServer[method](
          routeConfig.path,
          options,
          async (request: FastifyRequest, reply: FastifyReply) => {
            const startAt = Date.now();
            const session = await this.flowSvc.createSession(
              flow.id,
              request.id,
            );
            try {
              const response = await session.trigger(trigger.id, {
                meta: {
                  id: request.id,
                  ip: request.ip,
                  ips: request.ips,
                  cookie: request.cookies,
                  method: request.method,
                  hostname: request.hostname,
                  protocol: request.protocol,
                },
                headers: request.headers,
                params: request.params ?? {},
                query: request.query ?? {},
                body: request.body ?? null,
                url: request.url,
              });

              if (typeof response === 'object') {
                if ((response.meta?.config as any)?.statusCode) {
                  reply.statusCode = parseInt(
                    (response.meta.config as any).statusCode.toString(),
                    10,
                  );
                }
              }

              const elapsed = Date.now() - startAt;
              this.logger.info(
                'FlowSession [%s] executed in [%d] ms',
                session.id,
                elapsed,
              );

              return response.data;
            } catch (error) {
              reply.statusCode = 400;

              this.logger.warn(getErrorMessage(error));

              return {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Request does not match the expected input data',
              };
            }
          },
        );
      }
    }
  }
}
