import { IModule, Module } from '../../app/container';
import { moduleRef } from '../../app/container/module-ref';
import { IKernel } from '../../app/kernel';
import { FlowModule } from '../flow/flow.module';
import { EventService } from './event.service';
import { EventTrigger } from './lambda/event.trigger';
import { EventHandlerProvider } from './provider/event-handler.provider';

@Module({
  dependsOn: [moduleRef(() => FlowModule)],
  providers: [EventHandlerProvider, EventService, EventTrigger],
})
export class EventModule implements IModule {
  async onReady(kernel: IKernel) {
    (await kernel.get(EventService)).register(kernel);
  }

  async onStop(kernel: IKernel) {
    (await kernel.get(EventService)).deregister(kernel);
  }
}
