import { readFileSync } from 'fs';
import { join } from 'path';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { SEED_DIR } from '../../app/globals';
import { getErrorMessage } from '../../app/kernel';
import { DatabaseConnectionService } from '../database/service/database-connection.service';
import { RestService } from '../rest/service/rest.service';
import { IBlueprint } from './interface/blueprint.interface';
import { SystemBlueprintProvider } from './provider/system-blueprint.provider';

@Service()
export class BlueprintService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(SystemBlueprintProvider)
    readonly systemBlueprint: IBlueprint,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
  ) {}

  async seed() {
    const sysExists = await this.rest.read('main', 'Blueprint', {
      id: this.systemBlueprint.id,
    });

    if (!sysExists) {
      await this.rest.create('main', 'Blueprint', this.systemBlueprint as any);
      this.logger.info('Blueprint [system] installed');

      // Install the identity blueprint too
      await this.importFromSource(
        'main',
        JSON.parse(
          readFileSync(join(SEED_DIR, 'identity.blueprint.json')).toString(),
        ),
      );
    }
  }

  async importFromSource(database: string, blueprint: IBlueprint) {
    // Global db reference
    blueprint.database = database;

    const link = this.connections.findOne(database);

    // Preload the schemas before they are injected one by one.
    await link.associate(blueprint.schemas);

    // Replace the schema databases to the local db
    for (const schema of blueprint.schemas) {
      schema.database = database;

      await this.rest
        .create('main', 'Schema', schema as any)
        .then(() =>
          this.logger.info(
            'Schema [%s][%s] installed',
            blueprint.title,
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
    for (const wf of blueprint.flows) {
      await this.rest
        .create('main', 'Flow', wf as any)
        .then(() =>
          this.logger.info('Flow [%s][%s] installed', blueprint.title, wf.id),
        )
        .catch(e =>
          this.logger
            .warn('Could not create [%s] flow', wf.id)
            .warn(getErrorMessage(e)),
        );
    }

    // Save the blueprint
    await this.rest.create('main', 'Blueprint', blueprint as any);
    this.logger.info('Blueprint [%s] installed', blueprint.title);

    return blueprint;
  }
}
