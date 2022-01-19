import { IModule, Module } from '../../app/container';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';

@Module({
  dependsOn: [],
  providers: [TelemetryGateway, TelemetryService],
})
export class TelemetryModule implements IModule {}
