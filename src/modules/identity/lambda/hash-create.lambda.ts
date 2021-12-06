import { hash } from 'bcrypt';
import { Service } from '../../../app/container';
import { WorkflowSession } from '../../flow/library/workflow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';

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
  async invoke(ctx: WorkflowSession) {
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
