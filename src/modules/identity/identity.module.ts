import { IModule, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';
import { IdentityGateway } from './gateway/authentication.gateway';
import { HashCompareLambda } from './lambda/hash-compare.lambda';
import { HashCreateLambda } from './lambda/hash-create.lambda';
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
    TokenSignLambda,
  ],
  dependsOn: [moduleRef(() => DatabaseModule)],
})
export class IdentityModule implements IModule {}
