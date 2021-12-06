import { IModule, Module } from '../../app/container';
import { IKernel } from '../../app/kernel';
import { EventService } from './event.service';
import { EventTrigger } from './lambda/event.trigger';
import { EventHandlerProvider } from './provider/event-handler.provider';

@Module({
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
