import { IContext, Inject, Service } from '../../../system/container';
import { Lambda } from '../decorator/lambda.decorator';
import { InputHandleDTO } from '../dto/input-handle.dto';
import { OutputHandleDTO } from '../dto/output-handle.dto';
import { ILambda } from '../interface/lambda.interface';
import { LambdaService } from '../service/lambda.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'lambda.read',
  icon: 'system.png',
  description: 'List of registered lambdas',
  handles: [
    new InputHandleDTO('query', {}),
    new OutputHandleDTO('result', {
      type: 'array',
    }),
  ],
})
export class ReadLambdaLambda implements ILambda {
  constructor(
    @Inject.context()
    readonly ctx: IContext,
  ) {}

  async invoke() {
    return {
      result: (await this.ctx.get<LambdaService>('classes.LambdaService'))
        .findAll()
        .map(r => r.meta),
    };
  }
}
