import { Module } from '../container';
import { AuthGateway } from './gateway/auth.gateway';
import { TrapGateway } from './gateway/trap.gateway';

@Module({
  providers: [AuthGateway, TrapGateway],
})
export class SecurityModule {}
