import { IModule, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/collection.module';
import { ContentGateway } from './gateway/content.gateway';
import { ContentCreateLambda } from './lambda/content-create.lambda';
import { ContentService } from './service/content.service';

@Module({
  dependsOn: [SchemaModule, DatabaseModule],
  providers: [ContentService, ContentGateway, ContentCreateLambda],
})
export class ContentModule implements IModule {}
