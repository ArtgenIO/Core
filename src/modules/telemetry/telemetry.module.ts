import { IKernel, IModule, Module } from '@hisorange/kernel';
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
