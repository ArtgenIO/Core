import { Provider, Service } from '@hisorange/kernel';
import EventEmitter2 from 'eventemitter2';

@Service(EventEmitter2)
export class EventHandlerProvider implements Provider<EventEmitter2> {
  value(): EventEmitter2 {
    return new EventEmitter2({
      wildcard: true,
    });
  }
}
