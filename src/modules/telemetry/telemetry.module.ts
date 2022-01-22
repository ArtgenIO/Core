import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';

@Module({
  dependsOn: [],
  providers: [TelemetryGateway, TelemetryService],
})
export class TelemetryModule implements IModule {
  async onStop(kernel: IKernel): Promise<void> {
    (await kernel.get(TelemetryService)).clearTick();
  }
}
