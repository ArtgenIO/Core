import { ILogger, Inject, Logger } from '@hisorange/kernel';
import { Observer, On } from '../event';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IFlow, IFlowSessionContext } from './interface';
import { ICapturedContext } from './interface/captured-context.interface';

@Observer()
export class FlowObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
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
}
