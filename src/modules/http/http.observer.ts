import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { HttpService } from './service/http.service';

@Observer()
export class HttpObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(HttpService)
    readonly service: HttpService,
  ) {}

  @On('crud.main.Schema.*', {
    debounce: 500,
  })
  async handleSchemaChange() {
    this.service.updateUpstream();
  }

  @On('crud.main.Page.*', {
    debounce: 500,
  })
  async handlePageChange() {
    this.service.updateUpstream();
  }
}
