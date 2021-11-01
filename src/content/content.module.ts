import { Module } from '../system/container';
import { CollectionModule } from './collection/collection.module';
import { PageModule } from './page/page.module';

@Module({
  imports: [PageModule, CollectionModule],
})
export class ContentModule {}
