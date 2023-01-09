import { Module } from '@hisorange/kernel';
import { AdminGateway } from './controllers/admin.gateway';

@Module({
  providers: [AdminGateway],
})
export class Admin {}
