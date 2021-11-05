import { ISchema } from '..';
import { Lambda } from '../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../management/lambda/interface/lambda.interface';
import { JSCHEMA_ERR } from '../../../management/lambda/utility/json-schema.helpers';
import { WorkflowSession } from '../../../management/workflow/library/workflow.session';
import { getErrorMessage } from '../../../system/app/util/extract-error';
import { Inject, Service } from '../../../system/container';
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

  async invoke(sess: WorkflowSession) {
    const schema = sess.getInput('schema') as ISchema;

    try {
      sess.setOutput('result', await this.svc.create(schema));
    } catch (error) {
      sess.setOutput('error', {
        message: getErrorMessage(error),
      });

      console.error('Save error', error);
    }
  }
}
