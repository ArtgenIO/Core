import { Module } from '../../app/container';
import { AdminGateway } from './gateway/admin.gateway';

@Module({
  providers: [AdminGateway],
})
export class AdminModule {}
