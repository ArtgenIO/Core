import { Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { SchemaModule } from '../schema/schema.module';
import { RestFindLambda } from './lambda/rest-find.lambda';
import { RestListLambda } from './lambda/rest-list.lambda';
import { RestReadLambda } from './lambda/rest-read.lambda';
import { RestUpdateLambda } from './lambda/rest-update.lambda';
import { RestGateway } from './rest.gateway';
import { RestService } from './rest.service';

@Module({
  imports: [moduleRef(() => SchemaModule)],
  providers: [
    RestService,
    RestGateway,
    RestListLambda,
    RestReadLambda,
    RestFindLambda,
    RestUpdateLambda,
  ],
})
export class RestModule {}
