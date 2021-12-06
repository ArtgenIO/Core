import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { RestService } from '../rest/rest.service';
import { IBlueprint } from './interface/extension.interface';

@Observer()
export class BlueprintObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
  ) {}

  @On('crud.system.Blueprint.deleted')
  async handleBlueprintDelete(bp: IBlueprint) {
    this.logger.warn('Extension deletion detected!');

    for (const wf of bp.workflows) {
      await this.rest
        .delete('system', 'Workflow', {
          id: wf.id,
        })
        .then(() => this.logger.info('Associated workflow [%s] deleted', wf.id))
        .catch(() =>
          this.logger.error('Cloud not delete [%s] associated workflow', wf.id),
        );
    }

    for (const schema of bp.schemas) {
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
