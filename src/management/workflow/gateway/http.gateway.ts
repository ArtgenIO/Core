import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions,
} from 'fastify';
import { Authenticator } from 'fastify-passport';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { STRATEGY_CONFIG } from '../../../system/security/authentication/util/strategy.config';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { LambdaService } from '../../lambda/service/lambda.service';
import { HttpTriggerConfig } from '../../lambda/trigger/http.trigger';
import { WorkflowService } from '../service/workflow.service';

@Service({
  tags: 'http:gateway',
})
export class WorkflowHttpGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(WorkflowService)
    readonly workflow: WorkflowService,
    @Inject(LambdaService)
    readonly node: LambdaService,
    @Inject(Authenticator)
    readonly authenticator: Authenticator,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    for (const workflow of await this.workflow.findAll()) {
      const triggers = workflow.nodes.filter(t => t.type === 'trigger.http');

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
          workflow.id,
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

        let preHandlers = [];
        const swaggerSecurity = [];
        const isProtected = routeConfig.authentication == 'protected';

        if (isProtected) {
          // const strategies = [];
          // strategies.push();

          swaggerSecurity.push({
            jwt: [],
          });

          preHandlers.push(
            this.authenticator.authenticate(['token', 'jwt'], STRATEGY_CONFIG),
          );
        }

        const method = routeConfig.method.toLowerCase();
        const options: RouteShorthandOptions = {
          schema: {
            tags: ['Workflow'],
            description: `Invokes the [${workflow.id}/${trigger.id}] node`,
            params: paramSchema,
            security: swaggerSecurity,
          },
          preHandler: preHandlers,
        };

        httpServer[method](
          routeConfig.path,
          options,
          async (request: FastifyRequest, reply: FastifyReply) => {
            const startAt = Date.now();
            const session = await this.workflow.createWorkflowSession(
              workflow.id,
              request.id,
            );
            try {
              const response = await session.trigger(trigger.id, {
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
                'WFSession [%s] executed in [%d] ms',
                session.id,
                elapsed,
              );

              return response.data;
            } catch (error) {
              reply.statusCode = 400;

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
