import { Inject, Service } from '../../../app/container';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { SchemaService } from '../../schema/service/schema.service';
import { WorkflowSession } from '../../workflow/library/workflow.session';
import { AuthenticationService } from '../service/authentication.service';

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
    @Inject(AuthenticationService)
    readonly authService: AuthenticationService,
  ) {}

  async invoke(ctx: WorkflowSession) {
    const result = await this.authService.sigInWithCredentials(
      ctx.getInput('credentials') as Input,
    );

    if (result !== false) {
      return {
        jwt: result,
      };
    }

    return {
      error: {
        message: 'Authentication failed',
        code: 401,
      },
    };
  }
}
