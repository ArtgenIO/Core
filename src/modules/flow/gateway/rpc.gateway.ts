import { ActionSchema, Context, ServiceBroker, ServiceSchema } from 'moleculer';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { LambdaService } from '../../lambda/service/lambda.service';
import { IRpcGateway } from '../../rpc/interface/rpc-gateway.interface';
import { FlowService } from '../service/flow.service';

@Service({
  tags: 'rpc:gateway',
})
export class FlowRpcGateway implements IRpcGateway {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(FlowService)
    readonly flowSvc: FlowService,
    @Inject(LambdaService)
    readonly node: LambdaService,
  ) {}

  async register(rpcServer: ServiceBroker): Promise<void> {
    const service: ServiceSchema = {
      name: 'flow',
      actions: {},
    };

    for (const flow of await this.flowSvc.findAll()) {
      const triggers = flow.nodes.filter(t => t.type === 'trigger.rpc');

      for (const trigger of triggers) {
        const address = `${flow.id}.${trigger.id}`;

        this.logger.info(
          'RPC Node [%s][%s] registered at [flow.%s]',
          flow.id,
          trigger.id,
          address,
        );

        const action: ActionSchema = {
          name: address,
          handler: async (ctx: Context) => {
            this.logger.info('Relaying [%s] for [%s]', trigger.type, ctx.id);

            const session = await this.flowSvc.createSession(flow.id, ctx.id);

            return await session.trigger(trigger.id, ctx.params);
          },
        };

        service.actions[trigger.id] = action;
      }
    }

    rpcServer.createService(service);
  }
}
