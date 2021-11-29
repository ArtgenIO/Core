import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { RestService } from '../rest/rest.service';
import { IExtension } from './interface/extension.interface';

@Observer()
export class ExtensionObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
  ) {}

  @On('crud.system.Extension.deleted')
  async handleExtensionDelete(ext: IExtension) {
    this.logger.warn('Extension deletion detected!');

    for (const wf of ext.workflows) {
      await this.rest
        .delete('system', 'Workflow', {
          id: wf.id,
        })
        .then(() => this.logger.info('Associated workflow [%s] deleted', wf.id))
        .catch(() =>
          this.logger.error('Cloud not delete [%s] associated workflow', wf.id),
        );
    }

    for (const schema of ext.schemas) {
      this.rest
        .delete('system', 'Schema', {
          database: schema.database,
          reference: schema.reference,
        })
        .then(() =>
          this.logger.info('Associated schema [%s] deleted', schema.reference),
        )
        .catch(() =>
          this.logger.error(
            'Cloud not delete [%s] associated schema',
            schema.reference,
          ),
        );
    }
  }
}
