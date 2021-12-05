import { IModule, Inject, Module } from '../../app/container';
import { ExtensionModule } from '../blueprint/extension.module';
import { CollectionModule } from '../collection/collection.module';
import { IdentityGateway } from './gateway/authentication.gateway';
import { HashCompareLambda } from './lambda/hash-compare.lambda';
import { HashCreateLambda } from './lambda/hash-create.lambda';
import { SignInLambda } from './lambda/sign-in.lambda';
import { TokenSignLambda } from './lambda/token-sign.lambda';
import { AuthenticationHandlerProvider } from './provider/authentication-handler.provider';
import { AuthenticatorProvider } from './provider/authenticator.provider';
import { AuthenticationService } from './service/authentication.service';

@Module({
  providers: [
    AuthenticationHandlerProvider,
    AuthenticationService,
    AuthenticatorProvider,
    HashCompareLambda,
    HashCreateLambda,
    IdentityGateway,
    SignInLambda,
    TokenSignLambda,
  ],
  dependsOn: [CollectionModule, ExtensionModule],
})
export class IdentityModule implements IModule {
  constructor(
    @Inject(AuthenticationService)
    readonly auth: AuthenticationService,
  ) {}

  async onStart() {
    await this.auth.seed();
  }
}