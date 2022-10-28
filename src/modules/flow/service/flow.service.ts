import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';
import { Model } from 'objection';
import { v4 } from 'uuid';
import { SchemaService } from '../../database/service/schema.service';
import { SchemaRef } from '../../database/types/system-ref.enum';
import { LambdaService } from '../../lambda/service/lambda.service';
import { BucketKey } from '../../telemetry/interface/bucket-key.enum';
import { TelemetryService } from '../../telemetry/telemetry.service';
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
    @Inject(TelemetryService)
    readonly telemetry: TelemetryService,
    @Inject(EventEmitter2)
    readonly bus: EventEmitter2,
  ) {}

  async findAll(): Promise<IFlow[]> {
    return (
      await this.schema.getSysModel<FlowModel>(SchemaRef.FLOW).query()
    ).map(wf => wf.$toJson());
  }

  async createSession(id: string, actionId?: string) {
    const flow = await this.schema
      .getSysModel<FlowModel>(SchemaRef.FLOW)
      .query()
      .findById(id);

    if (!flow) {
      throw new Error(`Flow does not exists [${id}]`);
    }

    if (!actionId) {
      actionId = v4();
    }

    this.telemetry.record(BucketKey.FLOW_EXEC, 1);

    return new FlowSession(
      this.logger.child({ scope: `Flow.${id.substring(0, 8)}` }),
      this.lambda,
      this.bus,
      flow.$toJson(),
      actionId,
    );
  }

  async createFlow(flow: Omit<IFlow, 'id'>): Promise<IFlow> {
    const record = await this.schema
      .getSysModel<FlowModel>(SchemaRef.FLOW)
      .query()
      .insertAndFetch(flow);

    // Save to the database.
    this.logger.info('New flow [%s] has been created', record.id);

    return record.$toJson();
  }

  async updateFlow(flow: IFlow): Promise<IFlow> {
    const record = await this.schema
      .getSysModel<FlowModel>(SchemaRef.FLOW)
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
