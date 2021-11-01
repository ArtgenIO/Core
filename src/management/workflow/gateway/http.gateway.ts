import { FastifyInstance, FastifyRequest } from 'fastify';
import { ILogger, Inject, Logger, Service } from '../../../system/container';
import { IHttpGateway } from '../../../system/server/interface/http-gateway.interface';
import { LambdaService } from '../../lambda/service/lambda.service';
import { HttpTriggerConfig } from '../../lambda/trigger/http.trigger';
import { IWorkflow } from '../interface/serialized-workflow.interface';
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
          wf => wf.id === req.params.id,
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
        const config: Partial<HttpTriggerConfig> = {
          path: '/api/webhook/' + trigger.id,
          method: 'GET',
        };

        if (trigger.config) {
          const triggerConfig = trigger.config as HttpTriggerConfig;

          if (triggerConfig.path) {
            config.path = triggerConfig.path;
          }

          if (triggerConfig.method) {
            config.method = triggerConfig.method;
          }
        }

        this.logger.info(
          'WebHook [%s][%s] registered to [%s][%s]',
          workflow.id,
          trigger.id,
          config.method,
          config.path,
        );

        const paramSchema = {
          type: 'object',
          properties: {},
        };

        if (config.path.match(':')) {
          for (const routeParam of config.path.matchAll(/\:([^\/]+)(\/|$)/g)) {
            paramSchema.properties[routeParam[1]] = {
              type: 'string',
            };
          }
        }

        httpServer[config.method.toLowerCase()](
          config.path,
          {
            schema: {
              tags: ['$webhook'],
              description: `Invokes the [${workflow.id}/${trigger.id}] node`,
              params: paramSchema,
            },
          },
          async (req, rep) => {
            const startAt = Date.now();
            const session = await this.workflow.createWorkflowSession(
              workflow.id,
              req.id,
            );

            const response = await session.trigger(trigger.id, {
              headers: req.headers,
              params: req.params ?? {},
              query: req.query ?? {},
              body: req.body ?? null,
              url: req.url,
            });

            const elapsed = Date.now() - startAt;
            this.logger.info(
              'WFSession [%s] executed in [%d] ms',
              session.id,
              elapsed,
            );

            return response;
          },
        );
      }
    }
  }
}
