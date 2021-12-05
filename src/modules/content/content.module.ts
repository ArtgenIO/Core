import { IModule, Module } from '../../app/container';
import { CollectionModule } from '../collection/collection.module';
import { DatabaseModule } from '../database/database.module';
import { ContentGateway } from './gateway/content.gateway';
import { ContentCreateLambda } from './lambda/content-create.lambda';
import { ContentService } from './service/content.service';

@Module({
  dependsOn: [CollectionModule, DatabaseModule],
  providers: [ContentService, ContentGateway, ContentCreateLambda],
})
export class ContentModule implements IModule {}
