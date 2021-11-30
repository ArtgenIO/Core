import { ISchema } from '..';
import { Inject, Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { SchemaService } from '../service/schema.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  icon: 'system.png',
  type: 'schema.update',
  description: 'Update schema',
  handles: [
    new InputHandleDTO('schema', {}),
    new OutputHandleDTO('success', {
      type: 'boolean',
    }),
  ],
})
export class UpdateSchemaLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly svc: SchemaService,
  ) {}

  async invoke(sess: WorkflowSession) {
    const schema = sess.getInput('schema') as ISchema;

    try {
      await this.svc.update(schema);
      sess.setOutput('success', true);
    } catch (error) {
      sess.setOutput('success', false);
    }
  }
}