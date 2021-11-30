import { ILogger, IModule, Inject, Logger, Module } from '../../app/container';
import { SchemaModule } from '../schema/schema.module';
import { AuthenticationGateway } from './gateway/authentication.gateway';
import { HashCompareLambda } from './lambda/hash-compare.lambda';
import { HashCreateLambda } from './lambda/hash-create.lambda';
import { SignInLambda } from './lambda/sign-in.lambda';
import { TokenSignLambda } from './lambda/token-sign.lambda';
import { AuthenticationHandlerProvider } from './provider/authentication-handler.provider';
import { AuthenticatorProvider } from './provider/authenticator.provider';
import { AuthenticationService } from './service/authentication.service';

@Module({
  providers: [
    AuthenticationGateway,
    SignInLambda,
    AuthenticationService,
    AuthenticatorProvider,
    AuthenticationHandlerProvider,
    HashCreateLambda,
    HashCompareLambda,
    TokenSignLambda,
  ],
  dependsOn: [SchemaModule],
})
export class AuthenticationModule implements IModule {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(AuthenticationService)
    readonly service: AuthenticationService,
  ) {}

  async onStart() {
    await this.service.seed();
  }

  async onStop() {
    this.service.clearDeleteTimeout();
  }
}
