import { ICollection } from '../..';
import { Lambda } from '../../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../../management/lambda/interface/lambda.interface';
import { WorkflowSession } from '../../../../management/workflow/library/workflow.session';
import { Inject, Service } from '../../../../system/container';
import { CollectionService } from '../../service/collection.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  icon: 'system.png',
  type: 'collection.update',
  description: 'Update collection',
  handles: [
    new InputHandleDTO('collection', {}),
    new OutputHandleDTO('success', {
      type: 'boolean',
    }),
  ],
})
export class UpdateCollectionLambda implements ILambda {
  constructor(
    @Inject('classes.CollectionService')
    readonly svc: CollectionService,
  ) {}

  async invoke(sess: WorkflowSession) {
    const col = sess.getInput('collection') as ICollection;

    try {
      await this.svc.updateCollection(col);
      sess.setOutput('success', true);
    } catch (error) {
      sess.setOutput('success', false);

      console.error('Save error', error);
    }
  }
}
