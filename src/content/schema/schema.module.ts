import { WorkflowSchema } from '../../management/workflow/schema/workflow.schema';
import { IApplication } from '../../system/app/application.interface';
import { IModule, Module } from '../../system/container';
import { DatabaseSchema } from '../../system/database/schema/database.schema';
import { AccountSchema } from '../../system/security/authentication/schema/account.schema';
import { CreateSchemaLambda } from './lambda/create.lambda';
import { ReadSchemaLambda } from './lambda/read.lambda';
import { UpdateSchemaLambda } from './lambda/update.lambda';
import { SchemaSchema } from './schema/schema.schema';
import { SchemaService } from './service/schema.service';

@Module({
  providers: [
    SchemaService,
    CreateSchemaLambda,
    ReadSchemaLambda,
    UpdateSchemaLambda,
  ],
})
export class SchemaModule implements IModule {
  async onStart(app: IApplication) {
    const service = await app.context.get<SchemaService>(
      'classes.SchemaService',
    );

    service.register(AccountSchema, 'disk');
    service.register(SchemaSchema, 'disk');
    service.register(DatabaseSchema, 'disk');
    service.register(WorkflowSchema, 'disk');
  }
}
