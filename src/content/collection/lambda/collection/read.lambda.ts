import { Lambda } from '../../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../../management/lambda/interface/lambda.interface';
import { Inject, Service } from '../../../../system/container';
import { CollectionService } from '../../service/collection.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  icon: 'system.png',
  type: 'collection.read',
  description: 'Read collections',
  handles: [
    new OutputHandleDTO('result', {
      type: 'array',
    }),
    new InputHandleDTO('query', {}),
  ],
})
export class ReadCollectionLambda implements ILambda {
  constructor(
    @Inject('classes.CollectionService')
    readonly svc: CollectionService,
  ) {}

  async invoke() {
    return {
      result: Array.from(this.svc.findAll()),
    };
  }
}
