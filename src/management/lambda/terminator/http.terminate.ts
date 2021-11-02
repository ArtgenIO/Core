import { IContext, Inject, Service } from '../../../system/container';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { Lambda } from '../decorator/lambda.decorator';
import { InputHandleDTO } from '../dto/input-handle.dto';
import { ILambda } from '../interface/lambda.interface';
import { HttpTriggerConfig } from '../trigger/http.trigger';

type IConfig = {
  statusCode: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'terminate.http',
  icon: 'response.png',
  description: 'Formulate a HTTP response',
  handles: [new InputHandleDTO('response', {})],
  config: {
    type: 'object',
    properties: {
      statusCode: {
        title: 'Status Code',
        enum: ['200', '201', '400', '401', '404', '500'],
      },
    },
  },
})
export class HttpResponseLambda implements ILambda {
  constructor(
    @Inject.context()
    readonly ctx: IContext,
  ) {}

  async invoke(session: WorkflowSession) {
    const config = session.getConfig() as IConfig;
    const triggerId = session.initialTriggerId;

    // Change the
    (
      session.getContext().$nodes[triggerId].config as HttpTriggerConfig
    ).response = session.getInput('response') as string;

    (
      session.getContext().$nodes[triggerId].config as HttpTriggerConfig
    ).statusCode = parseInt(config.statusCode, 10);
  }
}
