import { AdminModule } from '../modules/admin/admin.module';
import { ExtensionModule } from '../modules/blueprint/extension.module';
import { ContentModule } from '../modules/content/content.module';
import { DatabaseModule } from '../modules/database/database.module';
import { EventModule } from '../modules/event';
import { HttpModule } from '../modules/http/http.module';
import { IdentityModule } from '../modules/identity/identity.module';
import { LambdaModule } from '../modules/lambda/lambda.module';
import { WorkflowModule } from '../modules/logic/workflow.module';
import { ODataModule } from '../modules/odata/odata.module';
import { PageModule } from '../modules/page/page.module';
import { RestModule } from '../modules/rest/rest.module';
import { RpcModule } from '../modules/rpc/rpc.module';
import { SchedulerModule } from '../modules/scheduler';
import { SchemaModule } from '../modules/schema/collection.module';
import { SecurityModule } from '../modules/security/security.module';
import { TransformerModule } from '../modules/transformer/transformer.module';
import { UpgradeModule } from '../modules/upgrade/upgrade.module';
import { ValidatorModule } from '../modules/validator/validator.module';
import { Module } from './container';
import { LogLambda } from './logger/log.lambda';

@Module({
  exports: [
    AdminModule,
    IdentityModule,
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
    WorkflowModule,
    ValidatorModule,
  ],
  providers: [LogLambda],
})
export class AppModule {}
