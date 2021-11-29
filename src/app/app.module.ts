import { AdminModule } from '../modules/admin/admin.module';
import { AuthenticationModule } from '../modules/authentication/authentication.module';
import { ContentModule } from '../modules/content/content.module';
import { DatabaseModule } from '../modules/database/database.module';
import { EventModule } from '../modules/event';
import { ExtensionModule } from '../modules/extension/extension.module';
import { HttpModule } from '../modules/http/http.module';
import { LambdaModule } from '../modules/lambda/lambda.module';
import { ODataModule } from '../modules/odata/odata.module';
import { PageModule } from '../modules/page/page.module';
import { RestModule } from '../modules/rest/rest.module';
import { RpcModule } from '../modules/rpc/rpc.module';
import { SchedulerModule } from '../modules/scheduler';
import { SchemaModule } from '../modules/schema/schema.module';
import { SecurityModule } from '../modules/security/security.module';
import { TransformerModule } from '../modules/transformer/transformer.module';
import { UpgradeModule } from '../modules/upgrade/upgrade.module';
import { ValidatorModule } from '../modules/validator/validator.module';
import { WorkflowModule } from '../modules/workflow/workflow.module';
import { Module } from './container';
import { LogLambda } from './logger/log.lambda';

@Module({
  exports: [
    AdminModule,
    AuthenticationModule,
    ContentModule,
    DatabaseModule,
    EventModule,
    ExtensionModule,
    HttpModule,
    LambdaModule,
    ODataModule,
    PageModule,
    RestModule,
    RpcModule,
    SchedulerModule,
    SchemaModule,
    SecurityModule,
    TransformerModule,
    UpgradeModule,
    ValidatorModule,
    WorkflowModule,
  ],
  providers: [LogLambda],
})
export class AppModule {}
