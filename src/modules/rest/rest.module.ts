import { Module } from '../../app/container';
import { RestFindLambda } from './lambda/rest-find.lambda';
import { RestListLambda } from './lambda/rest-list.lambda';
import { RestReadLambda } from './lambda/rest-read.lambda';
import { RestGateway } from './rest.gateway';
import { RestService } from './rest.service';

@Module({
  providers: [
    RestService,
    RestGateway,
    RestListLambda,
    RestReadLambda,
    RestFindLambda,
  ],
})
export class RestModule {}
