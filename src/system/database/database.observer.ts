import { ILogger, Logger } from '../container';
import { Observer, On } from '../event';

@Observer()
export class DatabaseObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  @On('schema.created')
  handleSchemaCreatedEvent(eventData: unknown) {
    this.logger.warn('Received event %s', eventData);
  }
}
