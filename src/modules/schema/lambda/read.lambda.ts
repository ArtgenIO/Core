import { Inject, Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
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
    @Inject(SchemaService)
    readonly svc: SchemaService,
  ) {}

  async invoke() {
    const schemas = await this.svc.findAll();

    return {
      result: schemas,
    };
  }
}
