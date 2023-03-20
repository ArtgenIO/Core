import { Service } from '@hisorange/kernel';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'length',
  icon: 'length.png',
  description: 'Get the length of an array or string',
  handles: [
    new LambdaInputHandleDTO('subject', {
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
    new LambdaOutputHandleDTO('length', {
      type: 'number',
    }),
  ],
})
export class LogicLengthLambda implements ILambda {
  async invoke(session: FlowSession) {
    return {
      length: session.getInput<string | unknown[]>('subject').length,
    };
  }
}
