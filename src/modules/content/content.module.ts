import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { DatabaseModule } from '../database/database.module';
import { SchemaModule } from '../schema/schema.module';

@Module({
  dependsOn: [SchemaModule, moduleRef(() => DatabaseModule)],
  providers: [],
})
export class ContentModule implements IModule {}
