import { ActionSchema, Context, ServiceBroker, ServiceSchema } from 'moleculer';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { LambdaService } from '../../lambda/service/lambda.service';
import { IRpcGateway } from '../../rpc/interface/rpc-gateway.interface';
import { WorkflowService } from '../service/workflow.service';

@Service({
  tags: 'rpc:gateway',
})
export class WorkflowRpcGateway implements IRpcGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(WorkflowService)
    readonly workflow: WorkflowService,
    @Inject(LambdaService)
    readonly node: LambdaService,
  ) {}

  async register(rpcServer: ServiceBroker): Promise<void> {
    const service: ServiceSchema = {
      name: 'workflow',
      actions: {},
    };

    for (const workflow of await this.workflow.findAll()) {
      const triggers = workflow.nodes.filter(t => t.type === 'trigger.rpc');

      for (const trigger of triggers) {
        const address = `${workflow.id}.${trigger.id}`;
        const entry = this.node.findByType(trigger.type);

        this.logger.info(
          'RPC Node [%s][%s] registered at [workflow.%s]',
          workflow.id,
          trigger.id,
          address,
        );

        const action: ActionSchema = {
          name: address,
          handler: async (ctx: Context) => {
            this.logger.info('Relaying [%s] for [%s]', trigger.type, ctx.id);

            const session = await this.workflow.createWorkflowSession(
              workflow.id,
              ctx.id,
            );

            return await session.trigger(trigger.id, ctx.params);
          },
        };

        service.actions[trigger.id] = action;
      }
    }

    rpcServer.createService(service);
  }
}
