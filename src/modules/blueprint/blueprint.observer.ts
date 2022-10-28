import { ILogger, Inject, Logger, Observer, On } from '@hisorange/kernel';
import { CrudService } from '../database/service/crud.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IBlueprint } from './interface/blueprint.interface';

@Observer()
export class BlueprintObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(CrudService)
    readonly crud: CrudService,
  ) {}

  @On(`crud.main.${SchemaRef.BLUEPRINT}.deleted`)
  async handleBlueprintDelete(bp: IBlueprint) {
    this.logger.warn('Blueprint deletion detected!');

    for (const schema of bp.schemas) {
      await this.crud
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
