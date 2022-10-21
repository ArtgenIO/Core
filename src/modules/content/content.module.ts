import { IModule, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/schema.module';
import { ContentMeiliIndexLambda } from './lambda/meili/index.lambda';

@Module({
  dependsOn: [SchemaModule, moduleRef(() => DatabaseModule)],
  providers: [ContentMeiliIndexLambda],
})
export class ContentModule implements IModule {}
