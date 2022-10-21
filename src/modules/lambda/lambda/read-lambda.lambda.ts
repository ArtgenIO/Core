import { IContext, Service } from '@hisorange/kernel';
import { inject } from '@loopback/context';
import { IFlow } from '../../flow/interface';
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
    @inject.context()
    readonly ctx: IContext,
  ) {}

  async onInit(flow: IFlow): Promise<void> {}

  async invoke() {
    const lambdas = (await this.ctx.get<LambdaService>(LambdaService.name))
      .findAll()
      .map(r => r.meta)
      .sort((a, b) => (a.type > b.type ? 1 : -1));

    return {
      result: lambdas,
    };
  }
}
