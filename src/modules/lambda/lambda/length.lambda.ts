import { Service } from '../../../app/container';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../decorator/lambda.decorator';
import { InputHandleDTO } from '../dto/input-handle.dto';
import { OutputHandleDTO } from '../dto/output-handle.dto';
import { ILambda } from '../interface/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'length',
  icon: 'length.png',
  description: 'Get the length of an array or string',
  handles: [
    new InputHandleDTO('subject', {
      title: 'Subject',
      oneOf: [
        {
          type: 'array',
        },
        {
          type: 'string',
        },
      ],
    }),
    new OutputHandleDTO('length', {
      type: 'number',
    }),
  ],
})
export class LengthLambda implements ILambda {
  async invoke(session: WorkflowSession) {
    return {
      length: session.getInput<string | unknown[]>('subject').length,
    };
  }
}
