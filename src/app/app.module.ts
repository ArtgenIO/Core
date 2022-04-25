import { AdminModule } from '../modules/admin/admin.module';
import { BlueprintModule } from '../modules/blueprint/blueprint.module';
import { ContentModule } from '../modules/content/content.module';
import { DatabaseModule } from '../modules/database/database.module';
import { EventModule } from '../modules/event';
import { FlowModule } from '../modules/flow/flow.module';
import { FormModule } from '../modules/form/form.module';
import { HttpModule } from '../modules/http/http.module';
import { IdentityModule } from '../modules/identity/identity.module';
import { LambdaModule } from '../modules/lambda/lambda.module';
import { PageModule } from '../modules/page/page.module';
import { RestModule } from '../modules/rest/rest.module';
import { SchedulerModule } from '../modules/scheduler';
import { SchemaModule } from '../modules/schema/schema.module';
import { SecurityModule } from '../modules/security/security.module';
import { TelemetryModule } from '../modules/telemetry/telemetry.module';
import { TransformerModule } from '../modules/transformer/transformer.module';
import { UpgradeModule } from '../modules/upgrade/upgrade.module';
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
    FormModule,
    HttpModule,
    IdentityModule,
    LambdaModule,
    PageModule,
    RestModule,
    SchedulerModule,
    SchemaModule,
    SecurityModule,
    TelemetryModule,
    TransformerModule,
    UpgradeModule,
  ],
  providers: [LogLambda],
})
export class AppModule {}
