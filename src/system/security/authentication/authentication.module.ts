import { SchemaModule } from '../../../content/schema/schema.module';
import { ILogger, IModule, Inject, Logger, Module } from '../../container';
import { AuthenticationGateway } from './gateway/authentication.gateway';
import { SignInLambda } from './lambda/sign-in.lambda';
import { AuthenticatorProvider } from './provider/authenticator.provider';
import { AuthenticationService } from './service/authentication.service';

@Module({
  providers: [
    AuthenticationGateway,
    SignInLambda,
    AuthenticationService,
    AuthenticatorProvider,
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
