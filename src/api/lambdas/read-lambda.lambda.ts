import { IContext, Service } from '@hisorange/kernel';
import { inject } from '@loopback/context';
import { Lambda } from '../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../dtos/lambda/output-handle.dto';
import { LambdaService } from '../services/lambda.service';
import { ILambda } from '../types/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'lambda.read',
  icon: 'system.png',
  description: 'List of registered lambdas',
  handles: [
    new LambdaInputHandleDTO('query', {}),
    new LambdaOutputHandleDTO('result', {
      type: 'array',
    }),
  ],
})
export class ReadLambdaLambda implements ILambda {
  constructor(
    @inject.context()
    readonly ctx: IContext,
  ) {}

  async onInit(): Promise<void> {}

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
