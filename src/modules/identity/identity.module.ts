import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { IKernel } from '../../app/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { SchemaModule } from '../schema/schema.module';
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
  dependsOn: [moduleRef(() => SchemaModule), moduleRef(() => BlueprintModule)],
})
export class IdentityModule implements IModule {
  async onReady(kernel: IKernel) {
    await (await kernel.get(AuthenticationService)).seed();
  }
}
