import { IModule, Module, moduleRef } from '@hisorange/kernel';
import { DatabaseModule } from '../database/database.module';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';
import { PageService } from './service/page.service';

@Module({
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [PageGateway, PageService, StaticGateway],
})
export class PageModule implements IModule {}
