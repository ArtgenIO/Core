import { IKernel, IModule, Module, moduleRef } from '@hisorange/kernel';
import { FlowModule } from '../flow/flow.module';
import { EventObserver } from './event.observer';
import { EventService } from './event.service';
import { EmitEventLambda } from './lambda/emit.lambda';
import { EventTrigger } from './lambda/event.trigger';
import { EventHandlerProvider } from './provider/event-handler.provider';

@Module({
  dependsOn: [moduleRef(() => FlowModule)],
  providers: [
    EventHandlerProvider,
    EventService,
    EventTrigger,
    EmitEventLambda,
    EventObserver,
  ],
})
export class EventModule implements IModule {
  async onStart(kernel: IKernel) {
    (await kernel.get(EventService)).register();
  }

  async onStop(kernel: IKernel) {
    (await kernel.get(EventService)).deregister();
  }
}
