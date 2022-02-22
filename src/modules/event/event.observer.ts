import { debounce, DebouncedFunc } from 'lodash';
import { Inject } from '../../app/container';
import { Observer, On } from '../event';
import { EventService } from './event.service';

@Observer()
export class EventObserver {
  protected __update: DebouncedFunc<() => Promise<void>>;

  constructor(
    @Inject(EventService)
    readonly service: EventService,
  ) {
    this.__update = debounce(() => this.service.register(), 300);
  }

  @On('crud.main.Flow.*')
  async onSchemaCread() {
    this.__update();
  }
}
