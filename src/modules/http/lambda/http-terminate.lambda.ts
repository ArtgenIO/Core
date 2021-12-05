import { inject } from '@loopback/context';
import { IContext, Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../logic/library/workflow.session';
import { HttpTriggerConfig } from './http-trigger.lambda';

type IConfig = {
  statusCode: string;
  transform: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'terminate.http',
  icon: 'response.png',
  description: 'Formulate a HTTP response',
  handles: [new InputHandleDTO('response', null)],
  config: {
    type: 'object',
    properties: {
      statusCode: {
        title: 'Status Code',
        enum: ['200', '201', '400', '401', '404', '500'],
      },
      transform: {
        title: 'Response Transformer',
        type: 'string',
        default: '{{ $input.response }}',
        description: 'Template or fixed value',
      },
    },
    required: ['statusCode'],
  },
})
export class HttpTerminateLambda implements ILambda {
  constructor(
    @inject.context()
    readonly ctx: IContext,
  ) {}

  async invoke(session: WorkflowSession) {
    const config = session.getConfig<IConfig>();
    const triggerId = session.initialTriggerId;
    const triggerNode = session.getContext().$nodes[triggerId]
      .config as HttpTriggerConfig;
    let response = session.getInput<string>('response');

    if (config?.transform) {
      if (session.isTemplateSyntax(config.transform)) {
        response = session.renderSyntax(config.transform);
      } else {
        response = config.transform;
      }
    }

    // Change the
    triggerNode.response = response;

    triggerNode.statusCode = parseInt(config.statusCode, 10);
  }
}
