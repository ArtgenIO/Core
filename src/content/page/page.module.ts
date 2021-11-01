import { Module } from '../../system/container';
import { PageGateway } from './gateway/page.gateway';
import { StaticGateway } from './gateway/static.gateway';

@Module({
  providers: [PageGateway, StaticGateway],
})
export class PageModule {}
