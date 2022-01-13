import { Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { DatabaseModule } from '../database/database.module';
import { EventModule } from '../event';
import { KeyValueService } from './service/key-value.service';
import { SchemaService } from './service/schema.service';

@Module({
  imports: [moduleRef(() => EventModule), moduleRef(() => BlueprintModule)],
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [KeyValueService, SchemaService],
})
export class SchemaModule {}
