import { inject } from '@loopback/context';
import { IContext, Service } from '../../../system/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowService } from '../service/workflow.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'workflow.read',
  icon: 'system.png',
  description: 'List of loaded workflows',
  handles: [
    new InputHandleDTO('query', {}),
    new OutputHandleDTO('result', {
      type: 'array',
    }),
  ],
})
export class ReadWorkflowLambda implements ILambda {
  constructor(
    @inject.context()
    readonly ctx: IContext,
  ) {}

  async invoke() {
    return {
      result: await (
        await this.ctx.get<WorkflowService>(WorkflowService.name)
      ).findAll(),
    };
  }
}
