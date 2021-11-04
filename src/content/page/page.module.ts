import { IApplication } from '../../system/app/application.interface';
import { IModule, Module } from '../../system/container';
import { DatabaseModule } from '../../system/database/database.module';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';
import { PageService } from './service/page.service';

@Module({
  dependsOn: [DatabaseModule],
  providers: [PageGateway, PageService, StaticGateway],
})
export class PageModule implements IModule {
  async onStart(app: IApplication) {
    const service = await app.context.get<PageService>('classes.PageService');

    await service.seed();
  }
}
