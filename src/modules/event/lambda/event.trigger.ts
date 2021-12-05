import { Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { ITriggerConfig } from '../../lambda/interface/trigger-config.interface';
import { JSCHEMA_TRIGGER } from '../../lambda/utility/json-schema.helpers';
import { WorkflowSession } from '../../logic/library/workflow.session';

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
