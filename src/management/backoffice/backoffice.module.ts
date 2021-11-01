import { Module } from '../../system/container';
import { BackOfficeGateway } from './gateway/backoffice.gateway';

@Module({
  providers: [BackOfficeGateway],
})
export class BackOfficeModule {}
