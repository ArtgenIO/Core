import { Module } from '../../app/container';
import { CreateSchemaLambda } from './lambda/create.lambda';
import { ReadSchemaLambda } from './lambda/read.lambda';
import { UpdateSchemaLambda } from './lambda/update.lambda';
import { CollectionService } from './service/collection.service';
import { KeyValueService } from './service/key-value.service';
import { MigrationService } from './service/migration.service';

@Module({
  providers: [
    CollectionService,
    MigrationService,
    CreateSchemaLambda,
    ReadSchemaLambda,
    UpdateSchemaLambda,
    KeyValueService,
  ],
})
export class CollectionModule {}
