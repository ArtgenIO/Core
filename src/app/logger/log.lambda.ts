import { Service } from '@hisorange/kernel';
import { FlowSession } from '../../modules/flow/library/flow.session';
import { Lambda } from '../../modules/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../modules/lambda/dto/input-handle.dto';
import { ILambda } from '../../modules/lambda/interface/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'log',
  icon: 'log.svg',
  description: 'Write message into STDOut',
  handles: [new InputHandleDTO('message')],
  config: {
    type: 'object',
    properties: {
      level: {
        title: 'Log Level',
        type: 'string',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'debug',
      },
    },
  },
})
export class LogLambda implements ILambda {
  async invoke(ctx: FlowSession) {
    const config = ctx.getConfig<{ level: string }>();
    let message = ctx.getInput('message');

    if (typeof message === 'object') {
      message = JSON.stringify(ctx.getInput('message'), null, 2);
    }

    ctx.logger[config.level]('%s', message);
  }
}
