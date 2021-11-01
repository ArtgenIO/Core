import { Module } from '../container';
import { DevelopGateway } from './develop.gateway';

@Module({
  providers: [DevelopGateway],
})
export class DevelopModule {}
