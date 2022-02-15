import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/schema.module';
import { ContentMeiliIndexLambda } from './lambda/meili/index.lambda';

@Module({
  dependsOn: [SchemaModule, moduleRef(() => DatabaseModule)],
  providers: [ContentMeiliIndexLambda],
})
export class ContentModule implements IModule {}
