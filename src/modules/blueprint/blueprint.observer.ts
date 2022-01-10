import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { RestService } from '../rest/service/rest.service';
import { IBlueprint } from './interface/blueprint.interface';

@Observer()
export class BlueprintObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
  ) {}

  @On('crud.main.Blueprint.deleted')
  async handleBlueprintDelete(bp: IBlueprint) {
    this.logger.warn('Blueprint deletion detected!');

    for (const wf of bp.flows) {
      await this.rest
        .delete('main', 'Flow', {
          id: wf.id,
        })
        .then(() => this.logger.info('Associated flow [%s] deleted', wf.id))
        .catch(() =>
          this.logger.error('Cloud not delete [%s] associated flow', wf.id),
        );
    }

    for (const schema of bp.schemas) {
      this.rest
        .delete('main', 'Schema', {
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
