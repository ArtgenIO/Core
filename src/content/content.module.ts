import { Module } from '../system/container';
import { DatabaseModule } from '../system/database/database.module';
import { CollectionModule } from './collection/collection.module';
import { PageModule } from './page/page.module';

@Module({
  exports: [PageModule, CollectionModule],
  dependsOn: [DatabaseModule],
})
export class ContentModule {}
