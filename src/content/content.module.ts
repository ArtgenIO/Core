import { Module } from '../system/container';
import { DatabaseModule } from '../system/database/database.module';
import { CrudModule } from './crud/crud.module';
import { PageModule } from './page/page.module';
import { SchemaModule } from './schema/schema.module';

@Module({
  exports: [PageModule, CrudModule, SchemaModule],
  dependsOn: [DatabaseModule],
})
export class ContentModule {}
