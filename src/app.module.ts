import { ContentModule } from './content/content.module';
import { ManagementModule } from './management/management.module';
import { Module } from './system/container';
import { SystemModule } from './system/system.module';

@Module({
  exports: [ContentModule, ManagementModule, SystemModule],
})
export class AppModule {}
