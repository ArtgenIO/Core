import { ILogger, Inject, Logger } from '../container';
import { Observer, On } from '../event';
import { ServerService } from './service/server.service';

@Observer()
export class ServerObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(ServerService)
    readonly service: ServerService,
  ) {}

  @On('crud.system.Schema.*')
  async handleSchemaCreate() {
    this.service.startHttpServer();
  }
}
