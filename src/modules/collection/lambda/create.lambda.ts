import { ICollection } from '..';
import { Inject, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel/util/extract-error';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { JSCHEMA_ERR } from '../../lambda/utility/json-schema.helpers';
import { WorkflowSession } from '../../logic/library/workflow.session';
import { CollectionService } from '../service/collection.service';

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
    @Inject(CollectionService)
    readonly svc: CollectionService,
  ) {}

  async invoke(sess: WorkflowSession) {
    const schema = sess.getInput('schema') as ICollection;

    try {
      sess.setOutput('result', await this.svc.create(schema));
    } catch (error) {
      sess.setOutput('error', {
        message: getErrorMessage(error),
      });
    }
  }
}
