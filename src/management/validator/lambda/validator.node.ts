import { Service } from '../../../system/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { WorkflowSession } from '../../workflow/library/workflow.session';

@Lambda({
  type: 'validator',
  description: 'Validate values',
  handles: [
    new InputHandleDTO('subject', {
      type: 'string',
    }),
    new OutputHandleDTO('valid', {
      type: 'boolean',
    }),
    new OutputHandleDTO('invalid', {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    }),
  ],
  config: {
    type: 'object',
    properties: {
      strict: {
        type: 'boolean',
      },
    },
  },
})
@Service({
  tags: 'lambda',
})
export class ValidatorLambda implements ILambda {
  async invoke(ctx: WorkflowSession) {
    if (ctx.getInput('subject') === 'a') {
      return {
        valid: true,
      };
    } else {
      return {
        invalid: {
          message: 'Could not pass the validation',
        },
      };
    }
  }
}
