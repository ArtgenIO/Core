import { ILogger, Inject, Logger } from '@hisorange/kernel';
import debounce from 'lodash.debounce';
import { Observer, On } from '../event';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IFlow, IFlowSessionContext } from './interface';
import { ICapturedContext } from './interface/captured-context.interface';
import { FlowSchedulerService } from './service/flow-scheduler.service.js';

@Observer()
export class FlowObserver {
  protected __flow_update: () => Promise<void>;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(FlowSchedulerService)
    readonly service: FlowSchedulerService,
  ) {
    this.__flow_update = debounce(() => this.service.register(), 300);
  }

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

  @On(`crud.main.${SchemaRef.FLOW}.*`)
  async onSchemaCread() {
    this.__flow_update();
  }
}
