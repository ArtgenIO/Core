import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { ITriggerConfig } from '../../../management/lambda/interface/trigger-config.interface';
import { JSCHEMA_TRIGGER } from '../../../management/lambda/utility/json-schema.helpers';
import { WorkflowSession } from '../../../management/workflow/library/workflow.session';
import { Service } from '../../../system/container';

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
    new OutputHandleDTO('event', {
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
        description: 'Event which triggers this workflow',
      },
      ...JSCHEMA_TRIGGER,
    },
    required: ['eventName'],
  },
})
export class EventTrigger implements ILambda {
  async invoke(session: WorkflowSession) {
    return {
      event: session.getContext().$trigger as {
        name: string;
        data: unknown;
      },
    };
  }
}
