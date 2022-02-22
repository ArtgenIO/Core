import { debounce, DebouncedFunc } from 'lodash';
import { Inject } from '../../app/container';
import { Observer, On } from '../event';
import { SchedulerService } from './scheduler.service';

@Observer()
export class SchedulerObserver {
  protected __update: DebouncedFunc<() => Promise<void>>;

  constructor(
    @Inject(SchedulerService)
    readonly service: SchedulerService,
  ) {
    this.__update = debounce(() => this.service.register(), 300);
  }

  @On('crud.main.Flow.*')
  async onSchemaCread() {
    this.__update();
  }
}
