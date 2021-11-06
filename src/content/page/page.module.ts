import { IModule, Module } from '../../system/container';
import { DatabaseModule } from '../../system/database/database.module';
import { IKernel } from '../../system/kernel/interface/kernel.interface';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';
import { PageService } from './service/page.service';

@Module({
  dependsOn: [DatabaseModule],
  providers: [PageGateway, PageService, StaticGateway],
})
export class PageModule implements IModule {
  async onStart(app: IKernel) {
    const service = await app.context.get<PageService>(PageService.name);

    await service.seed();
  }
}
