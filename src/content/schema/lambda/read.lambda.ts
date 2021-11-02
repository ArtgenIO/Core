import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { Inject, Service } from '../../../system/container';
import { SchemaService } from '../service/schema.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  icon: 'system.png',
  type: 'schema.read',
  description: 'Read Schemas',
  handles: [
    new OutputHandleDTO('result', {
      type: 'array',
    }),
    new InputHandleDTO('query'),
  ],
})
export class ReadSchemaLambda implements ILambda {
  constructor(
    @Inject('classes.SchemaService')
    readonly svc: SchemaService,
  ) {}

  async invoke() {
    const schemas = await this.svc.findAll();

    return {
      result: schemas,
    };
  }
}
