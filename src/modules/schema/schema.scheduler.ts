import { ILogger, Inject, Logger } from '../../app/container';
import { Job, Scheduler } from '../scheduler';
import { SchemaService } from './service/schema.service';

@Scheduler()
export class SchemaScheduler {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly service: SchemaService,
  ) {}

  @Job({
    timing: '0 * * * * *',
  })
  async refreshRegistry() {
    this.logger.debug('Registry cache reloading...');

    await this.service.findAll();
  }
}
