import { Module } from '../../app/container';
import { CreateSchemaLambda } from './lambda/create.lambda';
import { ReadSchemaLambda } from './lambda/read.lambda';
import { UpdateSchemaLambda } from './lambda/update.lambda';
import { KeyValueService } from './service/key-value.service';
import { SchemaMigrationService } from './service/schema-migration.service';
import { SchemaService } from './service/schema.service';

@Module({
  providers: [
    SchemaService,
    SchemaMigrationService,
    CreateSchemaLambda,
    ReadSchemaLambda,
    UpdateSchemaLambda,
    KeyValueService,
  ],
})
export class SchemaModule {}
