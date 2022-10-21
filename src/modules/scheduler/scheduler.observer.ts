import { Inject } from '@hisorange/kernel';
import debounce from 'lodash.debounce';
import { Observer, On } from '../event';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { SchedulerService } from './scheduler.service';

@Observer()
export class SchedulerObserver {
  protected __update: () => Promise<void>;

  constructor(
    @Inject(SchedulerService)
    readonly service: SchedulerService,
  ) {
    this.__update = debounce(() => this.service.register(), 300);
  }

  @On(`crud.main.${SchemaRef.FLOW}.*`)
  async onSchemaCread() {
    this.__update();
  }
}
