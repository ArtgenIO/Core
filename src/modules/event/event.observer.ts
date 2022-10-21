import { Inject } from '@hisorange/kernel';
import debounce from 'lodash.debounce';
import { Observer, On } from '../event';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { EventService } from './event.service';

@Observer()
export class EventObserver {
  protected __update: () => Promise<void>;

  constructor(
    @Inject(EventService)
    readonly service: EventService,
  ) {
    this.__update = debounce(() => this.service.register(), 300);
  }

  @On(`crud.main.${SchemaRef.FLOW}.*`)
  async onSchemaCread() {
    this.__update();
  }
}
