import { Module } from '../../app/container';
import { TrapGateway } from './gateway/trap.gateway';

@Module({
  providers: [TrapGateway],
})
export class SecurityModule {}
