import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/schema.module';
import { ContentGateway } from './gateway/content.gateway';
import { ContentCreateLambda } from './lambda/content-create.lambda';
import { ContentService } from './service/content.service';

@Module({
  dependsOn: [SchemaModule, moduleRef(() => DatabaseModule)],
  providers: [ContentService, ContentGateway, ContentCreateLambda],
})
export class ContentModule implements IModule {}
