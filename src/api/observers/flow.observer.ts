import { ILogger, Inject, Logger, Observer, On } from '@hisorange/kernel';
import { ICapturedContext } from '../../models/captured-context.interface';
import { CrudService } from '../services/crud.service';
import { FlowEventService } from '../services/flow-event.service';
import { FlowSchedulerService } from '../services/flow-scheduler.service';
import { IFlowSessionContext } from '../types/flow-session-context.interface';
import { IFlow } from '../types/flow.interface';
import { SchemaRef } from '../types/system-ref.enum';

@Observer()
export class FlowObserver {
  protected schedulerUpdate: () => Promise<void>;
  protected eventUpdate: () => Promise<void>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(CrudService)
    readonly crud: CrudService,
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

      await this.crud.create('main', SchemaRef.FLOW_EXEC, capturedContext);

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
