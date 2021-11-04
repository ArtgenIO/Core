import { Provider } from '@loopback/context';
import { EventEmitter2 } from 'eventemitter2';
import { Service } from '../../container';

@Service()
export class EventHandlerProvider implements Provider<EventEmitter2> {
  value(): EventEmitter2 {
    return new EventEmitter2({
      wildcard: true,
    });
  }
}
