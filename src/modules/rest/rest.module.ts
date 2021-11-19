import { Module } from '../../app/container';
import { RestGateway } from './rest.gateway';
import { RestService } from './rest.service';

@Module({
  providers: [RestService, RestGateway],
})
export class RestModule {}
