import { compareSync } from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { SchemaService } from '../../../../content/schema/service/schema.service';
import { Lambda } from '../../../../management/lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../../../management/lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../../../management/lambda/dto/output-handle.dto';
import { ILambda } from '../../../../management/lambda/interface/lambda.interface';
import { WorkflowSession } from '../../../../management/workflow/library/workflow.session';
import { Inject, Service } from '../../../container';

type Input = {
  email: string;
  password: string;
};

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'auth.sign.in',
  description: 'Sign In with email address and password',
  icon: 'sign.in.svg',
  handles: [
    new InputHandleDTO('credentials', {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          examples: ['hello@artgen.io'],
        },
        password: {
          type: 'string',
          examples: ['SuperLongPassword'],
        },
      },
      required: ['email', 'password'],
    }),
    new OutputHandleDTO('jwt', {
      type: 'string',
    }),
    new OutputHandleDTO('error', {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
        code: {
          type: 'number',
        },
      },
      required: ['message', 'code'],
    }),
  ],
})
export class SignInLambda implements ILambda {
  constructor(
    @Inject(SchemaService)
    readonly schemas: SchemaService,
  ) {}

  async invoke(ctx: WorkflowSession) {
    const model = this.schemas.model<{
      id: string;
      email: string;
      password: string;
    }>('system', 'Account');
    const credentials = ctx.getInput('credentials') as Input;

    const account = await model.findOne({
      where: {
        email: credentials.email,
      },
    });

    if (
      account &&
      compareSync(credentials.password, account.get('password') as string)
    ) {
      return {
        jwt: jsonwebtoken.sign(
          {
            id: account.get('id'),
            email: account.get('email'),
          },
          'TEST_JWT',
          {
            expiresIn: '24h',
          },
        ),
      };
    }

    return {
      error: {
        message: 'Nope, failed',
        code: 100,
      },
    };
  }
}
