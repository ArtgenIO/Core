import { Service } from '@hisorange/kernel';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { JSCHEMA_TRIGGER } from '../../library/json-schema.helpers';
import { ILambda } from '../../types/lambda.interface';
import { ITriggerConfig } from '../../types/trigger-config.interface';

export type EventTriggerConfig = {
  eventName: string;
} & ITriggerConfig;

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'trigger.event',
  icon: 'trigger.event.png',
  description: 'Start the process when an event is fired',
  handles: [
    new LambdaOutputHandleDTO('event', {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        data: {},
      },
    }),
  ],
  config: {
    type: 'object',
    properties: {
      eventName: {
        type: 'string',
        title: 'Event Name',
        default: '*',
        description: 'Event which triggers this flow',
      },
      ...JSCHEMA_TRIGGER,
    },
    required: ['eventName'],
  },
})
export class OnEventTrigger implements ILambda {
  async invoke(session: FlowSession) {
    return {
      event: session.getContext().$trigger as {
        name: string;
        data: unknown;
      },
    };
  }
}
