import { Service } from '@hisorange/kernel';
import { Lambda } from '../decorators/lambda.decorator';
import { InputHandleDTO } from '../dtos/input-handle.dto';
import { OutputHandleDTO } from '../dtos/output-handle.dto';
import { FlowSession } from '../library/flow.session';
import { ILambda } from '../types/lambda.interface';

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
  async invoke(session: FlowSession) {
    return {
      length: session.getInput<string | unknown[]>('subject').length,
    };
  }
}
