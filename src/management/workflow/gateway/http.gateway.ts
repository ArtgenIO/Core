import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions,
} from 'fastify';
import jsonwebtoken from 'jsonwebtoken';
import { getErrorMessage } from '../../../system/app/util/extract-error';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { LambdaService } from '../../lambda/service/lambda.service';
import { HttpTriggerConfig } from '../../lambda/trigger/http.trigger';
import { IWorkflow } from '../interface/workflow.interface';
import { WorkflowService } from '../service/workflow.service';

@Service({
  tags: 'http:gateway',
})
export class WorkflowHttpGateway implements IHttpGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject('classes.WorkflowService')
    readonly workflow: WorkflowService,
    @Inject('classes.LambdaService')
    readonly node: LambdaService,
  ) {}

  async register(httpServer: FastifyInstance): Promise<void> {
    // Read WF
    httpServer.get(
      '/api/workflow/:id',
      async (req: FastifyRequest<{ Params: { id: string } }>) => {
        return (await this.workflow.findAll()).find(
          wf => wf.id == req.params.id,
        );
      },
    );

    // Create WF
    httpServer.post(
      '/api/workflow',
      async (req: FastifyRequest<{ Body: Omit<IWorkflow, 'id'> }>) => {
        return await this.workflow.createWorkflow(req.body);
      },
    );

    // Update WF
    httpServer.patch(
      '/api/workflow/:id',
      async (req: FastifyRequest<{ Body: IWorkflow }>) => {
        return await this.workflow.updateWorkflow(req.body);
      },
    );

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
            httpServer.auth(
              [
                (request, reply, done) => {
                  this.logger.debug('Authenticating the request');

                  if (request.headers['authorization']) {
                    const tokenString = request.headers[
                      'authorization'
                    ].replace(/Bearer:\s+/, '');

                    try {
                      jsonwebtoken.verify(tokenString, 'TEST_JWT', {});

                      done();
                    } catch (error) {
                      this.logger.warn(
                        'Token problem! [%s]',
                        getErrorMessage(error),
                      );
                      done(new Error('Invalid JWT'));
                    }
                  } else {
                    done(new Error('Missing bearer token'));
                  }
                },
              ],
              {
                relation: 'or',
              },
            ),
          );
        }

        const method = routeConfig.method.toLowerCase();
        const options: RouteShorthandOptions = {
          schema: {
            tags: ['$webhook'],
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
          },
        );
      }
    }
  }
}
