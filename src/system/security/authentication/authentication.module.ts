import { hashSync } from 'bcrypt';
import { ConnectionManager } from 'typeorm';
import { IApplication } from '../../app/application.interface';
import { ILogger, IModule, Logger, Module } from '../../container';
import { DatabaseModule } from '../../database/database.module';
import { AccountEntity } from './collection/account.collection';
import { AuthenticationGateway } from './gateway/authentication.gateway';
import { SignInLambda } from './lambda/sign-in.lambda';

@Module({
  providers: [AuthenticationGateway, SignInLambda],
  dependsOn: [DatabaseModule],
})
export class AuthenticationModule implements IModule {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  async onStart(app: IApplication) {
    // Seed the demo account
    if (app.isEphemeral) {
      this.logger.debug('Seeding demo account');

      const connectionManager: ConnectionManager = await app.context.get(
        'providers.ConnectionManagerProvider',
      );
      const repository = connectionManager
        .get('system')
        .getRepository(AccountEntity);

      const account = repository.create({
        email: 'demo@artgen.io',
        password: hashSync('demo', 3),
      });

      await repository
        .save(account)
        .then(() =>
          this.logger.info(
            'Demo account is ready under the [demo@artgen.io] email address',
          ),
        )
        .catch(() => this.logger.error('Demo account could not be created!'));
    }
  }
}
