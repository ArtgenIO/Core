import { Inject } from '@hisorange/kernel';
import { Controller } from '../decorators/controller.decorator';
import { Get } from '../decorators/router.decorator';
import { LambdaService } from '../services/lambda.service';

@Controller({
  prefix: 'api/system/lambda',
})
export class LambdaController {
  constructor(
    @Inject(LambdaService)
    protected lambdaService: LambdaService,
  ) {}

  @Get({ path: '/', protected: true })
  async getLambdas() {
    return this.lambdaService
      .findAll()
      .map(r => r.meta)
      .sort((a, b) => (a.type > b.type ? 1 : -1));
  }
}
