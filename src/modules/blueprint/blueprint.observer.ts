import { ILogger, Inject, Logger } from '../../app/container';
import { Observer, On } from '../event';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
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

    for (const schema of bp.schemas) {
      await this.rest
        .delete('main', SchemaRef.SCHEMA, {
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
