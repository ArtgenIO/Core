import { Module, moduleRef } from '@hisorange/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { DatabaseModule } from '../database/database.module';
import { SchemaObserve } from './schema.observer';
import { KeyValueService } from './service/key-value.service';
import { SchemaService } from './service/schema.service';

@Module({
  imports: [moduleRef(() => BlueprintModule)],
  dependsOn: [moduleRef(() => DatabaseModule)],
  providers: [KeyValueService, SchemaService, SchemaObserve],
})
export class SchemaModule {}
