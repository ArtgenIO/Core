import { Service } from '@hisorange/kernel';
import { compare } from 'bcrypt';
import { Lambda } from '../../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../../library/flow.session';
import { ILambda } from '../../../types/lambda.interface';

type Input = {
  hash: string;
  plain: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'hash.compare',
  icon: 'hash.png',
  description: 'BCrypt hash comparison against plain text part',
  handles: [
    new LambdaInputHandleDTO('elements', {
      type: 'object',
      properties: {
        hash: {
          title: 'Hash',
          description: 'Hash to compare the plain text against',
          type: 'string',
        },
        plain: {
          title: 'Plain',
          description: 'Plain text to compare hash',
          type: 'string',
        },
      },
      required: ['hash', 'plain'],
    }),
    new LambdaOutputHandleDTO('yes', {
      type: 'boolean',
    }),
    new LambdaOutputHandleDTO('no', {
      type: 'boolean',
    }),
  ],
})
export class BCryptCompareLambda implements ILambda {
  async invoke(ctx: FlowSession) {
    const { hash, plain } = ctx.getInput<Input>('elements');
    const result = await compare(plain, hash);

    if (result) {
      return {
        yes: true,
      };
    }

    return {
      no: true,
    };
  }
}
