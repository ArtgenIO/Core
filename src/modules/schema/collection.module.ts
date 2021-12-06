import { Module } from '../../app/container';
import { CreateSchemaLambda } from './lambda/create.lambda';
import { ReadSchemaLambda } from './lambda/read.lambda';
import { UpdateSchemaLambda } from './lambda/update.lambda';
import { KeyValueService } from './service/key-value.service';
import { MigrationService } from './service/migration.service';
import { SchemaService } from './service/schema.service';

@Module({
  providers: [
    SchemaService,
    MigrationService,
    CreateSchemaLambda,
    ReadSchemaLambda,
    UpdateSchemaLambda,
    KeyValueService,
  ],
})
export class SchemaModule {}
