import { IModule, Module } from '../../app/container';
import { DatabaseModule } from '../database/database.module';
import { HealthCheckGateway } from './health-check.gateway';

@Module({
  imports: [DatabaseModule],
  providers: [HealthCheckGateway],
})
export class HealthCheckModule implements IModule {}
