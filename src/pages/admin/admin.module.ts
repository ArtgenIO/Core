import { Module } from '@hisorange/kernel';
import { AdminGateway } from './admin.gateway';

@Module({
  providers: [AdminGateway],
})
export class AdminModule {}
