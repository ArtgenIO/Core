import { Inject } from '../../app/container';
import { Observer, On } from '../event';
import { HttpService } from './service/http.service';

@Observer()
export class HttpObserver {
  constructor(
    @Inject(HttpService)
    readonly service: HttpService,
  ) {}

  @On('crud.main.Schema.*', {
    debounce: 500,
  })
  async onSchemaChange() {
    this.service.updateUpstream();
  }

  @On('crud.main.Page.*', {
    debounce: 500,
  })
  async onPageChange() {
    this.service.updateUpstream();
  }

  @On('crud.main.Flow.*', {
    debounce: 500,
  })
  async onFlowChange() {
    this.service.updateUpstream();
  }
}
