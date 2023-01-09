import { Service } from '@hisorange/kernel';
import { hash } from 'bcrypt';
import { Lambda } from '../decorators/lambda.decorator';
import { InputHandleDTO } from '../dtos/input-handle.dto';
import { OutputHandleDTO } from '../dtos/output-handle.dto';
import { FlowSession } from '../library/flow.session';
import { ILambda } from '../types/lambda.interface';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'hash.create',
  description: 'BCrypt hash comparison against plain text part',
  handles: [
    new InputHandleDTO('plain', {
      title: 'Plain text to hash',
      type: 'string',
    }),
    new OutputHandleDTO('hash', {
      type: 'string',
    }),
  ],
  config: {
    oneOf: [
      {
        title: 'Rounds',
        description: 'Salt rounds',
        type: 'number',
      },

      {
        title: 'Salt',
        description: 'Salt',
        type: 'string',
      },
    ],
  },
})
export class HashCreateLambda implements ILambda {
  async invoke(ctx: FlowSession) {
    const plain = ctx.getInput<string>('plain');
    let config: string | number = ctx.getConfig<string>();

    if (config.match(/\d+/)) {
      config = parseInt(config, 10);
    }

    return {
      result: await hash(plain, config),
    };
  }
}
