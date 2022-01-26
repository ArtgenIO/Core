import { sign, SignOptions } from 'jsonwebtoken';
import { Inject, Service } from '../../../app/container';
import { FlowSession } from '../../flow/library/flow.session';
import { Lambda } from '../../lambda/decorator/lambda.decorator';
import { InputHandleDTO } from '../../lambda/dto/input-handle.dto';
import { OutputHandleDTO } from '../../lambda/dto/output-handle.dto';
import { ILambda } from '../../lambda/interface/lambda.interface';
import { IJwtPayload } from '../interface/jwt-payload.interface';
import { AuthenticationService } from '../service/authentication.service';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'token.sign',
  icon: 'sign.png',
  description: 'Sign a Json Web Token for the given account',
  handles: [
    new InputHandleDTO('accountId', {
      title: 'Account ID',
      type: 'string',
      //examples: 'a0fdd03d-5e49-43cc-af23-07406c1012fc',
    }),
    new OutputHandleDTO('token', {
      title: 'JWT',
      type: 'string',
    }),
  ],
  config: {
    type: 'object',
    properties: {
      expiresIn: {
        title: 'Expiration Interval',
        type: 'string',
        default: '8h',
      },
    },
  },
})
export class TokenSignLambda implements ILambda {
  constructor(
    @Inject(AuthenticationService)
    readonly authService: AuthenticationService,
  ) {}

  async invoke(ctx: FlowSession) {
    const config = ctx.getConfig<SignOptions>();
    const accountId = ctx.getInput<string>('accountId');

    const payload: IJwtPayload = {
      aid: accountId,
      roles: [],
    };
    const secret = await this.authService.getJwtSecret();

    return {
      token: sign(payload, secret, {
        expiresIn: config.expiresIn,
      }),
    };
  }
}
