import { Module } from '@hisorange/kernel';
import { TrapGateway } from './gateway/trap.gateway';

@Module({
  providers: [TrapGateway],
})
export class SecurityModule {}
