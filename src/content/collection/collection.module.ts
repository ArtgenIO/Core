import { Module } from '../../system/container';
import { ReadCollectionLambda } from './lambda/collection/read.lambda';
import { UpdateCollectionLambda } from './lambda/collection/update.lambda';
import { CollectionService } from './service/collection.service';
import { CrudService } from './service/crud.service';
import { EntitySchemaService } from './service/entity-schema.service';

@Module({
  providers: [
    CollectionService,
    CrudService,
    EntitySchemaService,
    ReadCollectionLambda,
    UpdateCollectionLambda,
  ],
})
export class CollectionModule {}
