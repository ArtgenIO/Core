import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { SchemaService } from './service/schema.service';

@Observer()
export class SchemaObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(SchemaService)
    readonly service: SchemaService,
  ) {}

  @On('crud.main.Schema.*')
  async handleSchemaChange() {
    this.logger.info('Schema changed, refreshing the registry');
    // Refresh the registry by reading the current state from the database
    this.service.findAll();
  }
}
