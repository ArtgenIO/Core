import { Module } from '@hisorange/kernel';
import { AdminGateway } from './gateway/admin.gateway';

@Module({
  providers: [AdminGateway],
})
export class AdminModule {}
