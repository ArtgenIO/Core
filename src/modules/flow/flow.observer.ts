import { ILogger, Inject, Logger, Observer, On } from '@hisorange/kernel';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IFlow, IFlowSessionContext } from './interface';
import { ICapturedContext } from './interface/captured-context.interface';
import { FlowEventService } from './service/flow-event.service.js';
import { FlowSchedulerService } from './service/flow-scheduler.service.js';

@Observer()
export class FlowObserver {
  protected schedulerUpdate: () => Promise<void>;
  protected eventUpdate: () => Promise<void>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(FlowSchedulerService)
    readonly flowSchedulerService: FlowSchedulerService,
    @Inject(FlowEventService)
    readonly flowEventService: FlowEventService,
  ) {}

  @On('flow.*.finished')
  async onFlowFinished(
    sessionId: string,
    flow: IFlow,
    context: IFlowSessionContext,
    debugTrace: [string, number][],
    startedAt: number,
  ) {
    if (flow.captureContext) {
      const capturedContext: Omit<ICapturedContext, 'createdAt'> = {
        id: sessionId,
        flowId: flow.id,
        elapsedTime: Date.now() - startedAt,
        debugTrace,
        context,
      };

      await this.rest.create('main', SchemaRef.FLOW_EXEC, capturedContext);

      this.logger.info('Flow [%s] session [%s] stored', flow.id, sessionId);
    }
  }

  @On(`crud.main.${SchemaRef.FLOW}.*`, {
    debounce: 300,
  })
  async onSchemaCread() {
    this.flowSchedulerService.register();
    this.flowEventService.register();
  }
}
