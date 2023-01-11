import { Inject, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';

type Config = {
  name: string;
  sync: boolean;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'event.emit',
  description: 'Emit an event',
  handles: [
    new LambdaInputHandleDTO('params', {
      type: 'array',
    }),
    new LambdaOutputHandleDTO('result', {
      type: 'boolean',
    }),
    new LambdaOutputHandleDTO('error', {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        code: {
          type: 'number',
        },
      },
      required: ['message', 'code'],
    }),
  ],
  config: {
    type: 'object',
    properties: {
      name: {
        title: 'Event Name',
        type: 'string',
        examples: ['order.delivered'],
      },
      synch: {
        title: 'Synch',
        type: 'boolean',
        default: false,
      },
    },
    required: ['name'],
  },
})
export class EmitEventLambda implements ILambda {
  constructor(
    @Inject(EventEmitter2)
    readonly eventBus: EventEmitter2,
  ) {}

  async invoke(session: FlowSession) {
    const input = (session.getInput('params') ?? []) as any[];
    const config = session.getConfig() as Config;

    try {
      const result = this.eventBus.emit(config.name, ...input);

      return {
        result,
      };
    } catch (error) {
      return {
        error: {
          message: (error as Error)?.message,
          code: 500,
        },
      };
    }
  }
}
