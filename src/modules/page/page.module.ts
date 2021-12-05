import { IModule, Module } from '../../app/container';
import { CollectionModule } from '../collection/collection.module';
import { DatabaseModule } from '../database/database.module';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';
import { PageService } from './service/page.service';

@Module({
  dependsOn: [DatabaseModule, CollectionModule],
  providers: [PageGateway, PageService, StaticGateway],
})
export class PageModule implements IModule {}
