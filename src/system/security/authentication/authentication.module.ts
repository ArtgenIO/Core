import { hashSync } from 'bcrypt';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { IApplication } from '../../app/application.interface';
import { ILogger, IModule, Logger, Module } from '../../container';
import { DatabaseModule } from '../../database/database.module';
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
    if (app.isEphemeral || process.env.NODE_ENV !== 'production') {
      this.logger.debug('Seeding [demo] account');

      const col = await app.context.get<SchemaService>('classes.SchemaService');
      const repository = col.getRepository('system', 'Account');
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
