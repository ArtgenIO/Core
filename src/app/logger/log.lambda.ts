import { WorkflowSession } from '../../modules/flow/library/workflow.session';
import { Lambda } from '../../modules/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../modules/lambda/dto/input-handle.dto';
import { ILambda } from '../../modules/lambda/interface/lambda.interface';
import { ILogger, Logger, Service } from '../container';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'log',
  icon: 'log.png',
  description: 'Log with debug level',
  handles: [new InputHandleDTO('message')],
  config: {
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
    default: 'debug',
    title: 'Level',
  },
})
export class LogLambda implements ILambda {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async invoke(ctx: WorkflowSession) {
    const instance = this.logger.child({
      scope: `workflow:${ctx.workflow.id}`,
    });
    const level = ctx.getConfig();

    instance.log(level as string, '%s', ctx.getInput('message'));
  }
}
