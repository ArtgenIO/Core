import { AdminModule } from '../modules/admin/admin.module';
import { BlueprintModule } from '../modules/blueprint/blueprint.module';
import { ContentModule } from '../modules/content/content.module';
import { DatabaseModule } from '../modules/database/database.module';
import { EventModule } from '../modules/event';
import { FlowModule } from '../modules/flow/flow.module';
import { HealthCheckModule } from '../modules/health-check/health-check.module';
import { HttpModule } from '../modules/http/http.module';
import { IdentityModule } from '../modules/identity/identity.module';
import { LambdaModule } from '../modules/lambda/lambda.module';
import { PageModule } from '../modules/page/page.module';
import { RestModule } from '../modules/rest/rest.module';
import { RpcModule } from '../modules/rpc/rpc.module';
import { SchedulerModule } from '../modules/scheduler';
import { SchemaModule } from '../modules/schema/schema.module';
import { SecurityModule } from '../modules/security/security.module';
import { TransformerModule } from '../modules/transformer/transformer.module';
import { UpgradeModule } from '../modules/upgrade/upgrade.module';
import { ValidatorModule } from '../modules/validator/validator.module';
import { Module } from './container';
import { LogLambda } from './logger/log.lambda';

@Module({
  imports: [
    AdminModule,
    BlueprintModule,
    ContentModule,
    DatabaseModule,
    EventModule,
    FlowModule,
    HealthCheckModule,
    HttpModule,
    IdentityModule,
    LambdaModule,
    PageModule,
    RestModule,
    RpcModule,
    SchedulerModule,
    SchemaModule,
    SecurityModule,
    TransformerModule,
    UpgradeModule,
    ValidatorModule,
  ],
  providers: [LogLambda],
})
export class AppModule {}
