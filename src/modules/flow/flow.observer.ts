import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IFlow, IFlowSessionContext } from './interface';

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
    ctx: IFlowSessionContext,
    stackTrace: string,
    startedAt: number,
  ) {
    if (flow.captureContext) {
      await this.rest.create('main', SchemaRef.FLOW_EXEC, {
        id: sessionId,
        flowId: flow.id,
        elapsedTime: Date.now() - startedAt,
        context: ctx,
      });

      this.logger.info('Flow [%s] session [%s] stored', flow.id, sessionId);
    }
  }
}
