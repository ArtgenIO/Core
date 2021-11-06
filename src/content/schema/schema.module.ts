import { Module } from '../../system/container';
import { CreateSchemaLambda } from './lambda/create.lambda';
import { ReadSchemaLambda } from './lambda/read.lambda';
import { UpdateSchemaLambda } from './lambda/update.lambda';
import { SchemaMigrationService } from './service/schema-migration.service';
import { SchemaService } from './service/schema.service';

@Module({
  providers: [
    SchemaService,
    SchemaMigrationService,
    CreateSchemaLambda,
    ReadSchemaLambda,
    UpdateSchemaLambda,
  ],
})
export class SchemaModule {}
