import { Module } from '@hisorange/kernel';
import { AdminModule } from '../modules/admin/admin.module';
import { BackendModule } from './backend.module';

@Module({
  imports: [AdminModule, BackendModule],
})
export class AppModule {}
