import { ISchema } from '..';
import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel/util/extract-error';
import { FlowSession } from '../../flow/library/flow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { JSCHEMA_ERR } from '../../lambda/utility/json-schema.helpers';
import { SchemaService } from '../service/schema.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  icon: 'system.png',
  type: 'schema.create',
  description: 'Create schema',
  handles: [
    new InputHandleDTO('schema', {
      type: 'object',
    }),
    new OutputHandleDTO('result', {
      type: 'object',
    }),
    new OutputHandleDTO('error', JSCHEMA_ERR),
  ],
})
export class CreateSchemaLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly svc: SchemaService,
  ) {}

  async invoke(sess: FlowSession) {
    const schema = sess.getInput('schema') as ISchema;

    try {
      sess.setOutput('result', await this.svc.create(schema));
    } catch (error) {
      sess.setOutput('error', {
        message: getErrorMessage(error),
      });
    }
  }
}
