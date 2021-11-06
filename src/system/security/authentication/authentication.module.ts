import { hashSync } from 'bcrypt';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { ILogger, IModule, Logger, Module } from '../../container';
import { DatabaseModule } from '../../database/database.module';
import { IKernel } from '../../kernel/interface/kernel.interface';
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

  async onStart(app: IKernel) {
    // Seed the demo account
    this.logger.debug('Seeding [demo] account');

    const col = await app.context.get<SchemaService>(SchemaService.name);
    const model = col.model('system', 'Account');
    const check = await model.count({
      where: {
        email: 'demo@artgen.io',
      },
    });

    if (check) {
      return;
    }

    const account = await model.create({
      email: 'demo@artgen.io',
      password: hashSync('demo', 3),
    });

    this.logger.info(
      'Demo account is ready under the [demo@artgen.io] email address',
    );
  }
}
