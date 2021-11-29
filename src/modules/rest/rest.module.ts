import { Module } from '../../app/container';
import { RestListLambda } from './lambda/rest-list.lambda';
import { RestReadLambda } from './lambda/rest-read.lambda';
import { RestGateway } from './rest.gateway';
import { RestService } from './rest.service';

@Module({
  providers: [RestService, RestGateway, RestListLambda, RestReadLambda],
})
export class RestModule {}
