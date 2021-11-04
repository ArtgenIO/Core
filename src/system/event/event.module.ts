import { Module } from '../container';
import { EventHandlerProvider } from './provider/event-handler.provider';

@Module({
  providers: [EventHandlerProvider],
})
export class EventModule {}
