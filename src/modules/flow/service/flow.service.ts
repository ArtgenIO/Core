import { Model } from 'objection';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { LambdaService } from '../../lambda/service/lambda.service';
import { SchemaService } from '../../schema/service/schema.service';
import { IFlow } from '../interface/flow.interface';
import { FlowSession } from '../library/flow.session';

type FlowModel = IFlow & Model;

@Service()
export class FlowService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(LambdaService)
    readonly lambda: LambdaService,
    @Inject(SchemaService)
    readonly schema: SchemaService,
  ) {}

  async findAll(): Promise<IFlow[]> {
    return (await this.schema.getModel<FlowModel>('main', 'Flow').query()).map(
      wf => wf.$toJson(),
    );
  }

  async createSession(id: string, actionId?: string) {
    const flow = await this.schema
      .getModel<FlowModel>('main', 'Flow')
      .query()
      .findById(id);

    if (!flow) {
      throw new Error(`Flow does not exists [${id}]`);
    }

    if (!actionId) {
      actionId = v4();
    }

    return new FlowSession(
      this.logger.child({ scope: `Flow.${id.substring(0, 8)}` }),
      this.lambda,
      flow.$toJson(),
      actionId,
    );
  }

  async createFlow(flow: Omit<IFlow, 'id'>): Promise<IFlow> {
    const record = await this.schema
      .getModel<FlowModel>('main', 'Flow')
      .query()
      .insertAndFetch(flow);

    // Save to the database.
    this.logger.info('New flow [%s] has been created', record.id);

    return record.$toJson();
  }

  async updateFlow(flow: IFlow): Promise<IFlow> {
    const record = await this.schema
      .getModel<FlowModel>('main', 'Flow')
      .query()
      .findById(flow.id);

    record.$set({
      name: flow.name,
      nodes: flow.nodes,
      edges: flow.edges,
    });

    // Update to the database.
    await record.$query().update();

    this.logger.info('Flow [%s] updated', flow.id);

    return record.$toJson();
  }
}
