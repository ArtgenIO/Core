import { ILogger, Inject, Logger, Service } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { RestService } from '../rest/rest.service';
import { IExtension } from './interface/extension.interface';

@Service()
export class ExtensionService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
  ) {}

  async importFromSource(database: string, extension: IExtension) {
    // Global db reference
    extension.database = database;

    // Replace the schema databases to the local db
    for (const schema of extension.schemas) {
      schema.database = database;

      await this.rest
        .create('system', 'Schema', schema as any)
        .then(() => this.logger.info('Schema [%s] created', schema.reference))
        .catch(e =>
          this.logger
            .warn('Could not create [%s] schema', schema.reference)
            .warn(getErrorMessage(e)),
        );
    }

    // TODO find database references and replace them
    for (const wf of extension.workflows) {
      await this.rest
        .create('system', 'Workflow', wf as any)
        .then(() => this.logger.info('Workflow [%s] created', wf.name))
        .catch(e =>
          this.logger
            .warn('Could not create [%s] workflow', wf.name)
            .warn(getErrorMessage(e)),
        );
    }

    // Save the extension
    await this.rest.create('system', 'Extension', extension as any);

    return extension;
  }
}
