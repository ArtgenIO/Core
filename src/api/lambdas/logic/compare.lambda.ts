import { Service } from '@hisorange/kernel';
import { Lambda } from '../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../library/flow.session';
import { ILambda } from '../../types/lambda.interface';

type Config = {
  operator: '==' | '>=' | '<=' | '!=' | '===' | '!==';
  against: number | string | boolean;
  negate: boolean;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'compare',
  icon: 'compare.png',
  description: 'IF compare subject against a defined value',
  handles: [
    new LambdaInputHandleDTO('subject', {
      title: 'Subject',
      oneOf: [
        {
          type: 'number',
        },
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
      ],
    }),
    new LambdaOutputHandleDTO('yes', {
      type: 'boolean',
      default: true,
    }),
    new LambdaOutputHandleDTO('no', {
      type: 'boolean',
      default: false,
    }),
  ],
  config: {
    type: 'object',
    properties: {
      operator: {
        title: 'Operator',
        enum: ['==', '>=', '<=', '!=', '==='],
        default: '==',
      },
      against: {
        title: 'Against',
        oneOf: [
          {
            title: 'True',
            type: 'boolean',
          },
          {
            title: 'Text',
            type: 'string',
          },
          {
            title: 'Number',
            type: 'number',
          },
        ],
        default: true,
      },
      negate: {
        title: 'Negate',
        description: 'Invert the outcome',
        type: 'boolean',
        default: false,
      },
    },
    required: ['operator', 'against', 'negate'],
  },
})
export class LogicCompareLambda implements ILambda {
  async invoke(session: FlowSession) {
    const subject = session.getInput('subject');
    const { operator, against, negate } = session.getConfig<Config>();
    let result: boolean;

    switch (operator) {
      case '==':
        result = subject == against;
        break;
      case '>=':
        result = subject >= against;
        break;
      case '<=':
        result = subject <= against;
        break;
      case '!=':
        result = subject != against;
        break;
      case '===':
        result = subject === against;
        break;
      case '!==':
        result = subject !== against;
        break;
    }

    if (result != negate) {
      return {
        yes: true,
      };
    } else {
      return {
        no: true,
      };
    }
  }
}
