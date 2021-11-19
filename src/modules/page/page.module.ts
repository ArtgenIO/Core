import { IModule, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/schema.module';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';
import { PageService } from './service/page.service';

@Module({
  dependsOn: [DatabaseModule, SchemaModule],
  providers: [PageGateway, PageService, StaticGateway],
})
export class PageModule implements IModule {}
