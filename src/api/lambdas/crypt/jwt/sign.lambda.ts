import { Inject, Service } from '@hisorange/kernel';
import jwt, { SignOptions } from 'jsonwebtoken';

import { Model } from 'objection';
import { IAccount } from '../../../../models/account.interface';
import { Lambda } from '../../../decorators/lambda.decorator';
import { LambdaInputHandleDTO } from '../../../dtos/lambda/input-handle.dto';
import { LambdaOutputHandleDTO } from '../../../dtos/lambda/output-handle.dto';
import { FlowSession } from '../../../library/flow.session';
import { AuthenticationService } from '../../../services/authentication.service';
import { SchemaService } from '../../../services/schema.service';
import { IJwtPayload } from '../../../types/jwt-payload.interface';
import { ILambda } from '../../../types/lambda.interface';
import { SchemaRef } from '../../../types/system-ref.enum';

@Service({
  tags: 'lambda',
})
@Lambda({
  type: 'token.sign',
  icon: 'sign.png',
  description: 'Sign a Json Web Token for the given account',
  handles: [
    new LambdaInputHandleDTO('accountId', {
      title: 'Account ID',
      type: 'string',
      //examples: 'a0fdd03d-5e49-43cc-af23-07406c1012fc',
    }),
    new LambdaOutputHandleDTO('token', {
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
export class JWTSignLambda implements ILambda {
  constructor(
    @Inject(AuthenticationService)
    readonly authService: AuthenticationService,
    @Inject(SchemaService)
    readonly schemaService: SchemaService,
  ) {}

  async invoke(ctx: FlowSession) {
    const config = ctx.getConfig<SignOptions>();
    const accountId = ctx.getInput<string>('accountId');
    const accountModel = this.schemaService.getSysModel<IAccount & Model>(
      SchemaRef.ACCOUNT,
    );
    const account = await accountModel.query().findById(accountId);

    const payload: IJwtPayload = {
      aid: accountId,
      tid: account.groupId,
    };
    const secret = await this.authService.getJwtSecret();

    return {
      token: jwt.sign(payload, secret, {
        expiresIn: config.expiresIn,
      }),
    };
  }
}
