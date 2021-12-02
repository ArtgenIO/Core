import { EventEmitter2 } from 'eventemitter2';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { SEED_DIR } from '../../app/globals';
import { getErrorMessage } from '../../app/kernel';
import { LinkService } from '../database/service/link.service';
import { RestService } from '../rest/rest.service';
import { IExtension } from './interface/extension.interface';
import { SystemExtensionProvider } from './provider/system-extension.provider';

@Service()
export class ExtensionService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(SystemExtensionProvider)
    readonly sysExt: IExtension,
    @Inject(EventEmitter2)
    readonly events: EventEmitter2,
    @Inject(LinkService)
    readonly linkService: LinkService,
  ) {}

  async seed() {
    const exists = await this.rest.read('system', 'Extension', {
      id: this.sysExt.id,
    });

    if (!exists) {
      await this.rest.create('system', 'Extension', this.sysExt as any);
      this.logger.info('Extension [system] installed');

      // Install the identity extension too
      await this.importFromSource(
        'system',
        JSON.parse(
          readFileSync(join(SEED_DIR, 'identity.extension.json')).toString(),
        ),
      );
    }
  }

  async importFromSource(database: string, extension: IExtension) {
    // Global db reference
    extension.database = database;

    const link = this.linkService.findByName(database);

    // Preload the schemas before they are injected one by one.
    await link.associate(extension.schemas);

    // Replace the schema databases to the local db
    for (const schema of extension.schemas) {
      schema.database = database;

      await this.rest
        .create('system', 'Schema', schema as any)
        .then(() =>
          this.logger.info(
            'Schema [%s][%s] installed',
            extension.label,
            schema.reference,
          ),
        )
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
        .then(() =>
          this.logger.info(
            'Workflow [%s][%s] installed',
            extension.label,
            wf.id,
          ),
        )
        .catch(e =>
          this.logger
            .warn('Could not create [%s] workflow', wf.id)
            .warn(getErrorMessage(e)),
        );
    }

    // Save the extension
    await this.rest.create('system', 'Extension', extension as any);
    this.logger.info('Extension [%s] installed', extension.label);

    return extension;
  }
}
