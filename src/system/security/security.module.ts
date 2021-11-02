import { Module } from '../container';
import { AuthenticationModule } from './authentication/authentication.module';
import { TrapGateway } from './gateway/trap.gateway';

@Module({
  exports: [AuthenticationModule],
  providers: [TrapGateway],
})
export class SecurityModule {}
