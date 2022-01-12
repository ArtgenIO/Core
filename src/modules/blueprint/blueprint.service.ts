import { readFileSync } from 'fs';
import { join } from 'path';
import { ILogger, Inject, Logger, Service } from '../../app/container';
import { SEED_DIR } from '../../app/globals';
import { getErrorMessage } from '../../app/kernel';
import { DatabaseConnectionService } from '../database/service/database-connection.service';
import { RestService } from '../rest/service/rest.service';
import { IBlueprint } from './interface/blueprint.interface';
import { SystemBlueprintProvider } from './provider/system-blueprint.provider';

type R = Record<string, unknown>;

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
      await this.install('main', this.systemBlueprint);

      // Install the identity blueprint too
      await this.install(
        'main',
        JSON.parse(
          readFileSync(join(SEED_DIR, 'identity.blueprint.json')).toString(),
        ),
      );
    }
  }

  async install(database: string, blueprint: IBlueprint) {
    // Global db reference
    blueprint.database = database;

    const link = this.connections.findOne(database);

    // TODO: split this into two phase, check if we create the schema for the data now, or can we inject data safely
    if (blueprint?.content) {
      for (const schema in blueprint.content) {
        if (Object.prototype.hasOwnProperty.call(blueprint.content, schema)) {
          const rows = blueprint.content[schema];

          for (const row of rows) {
            const isExists = await this.rest.read('main', schema, row);

            if (!isExists) {
              await this.rest.create(database, schema, row);
            }
          }
        }
      }
    }

    // Preload the schemas before they are injected one by one.
    if (blueprint?.schemas && blueprint.schemas.length) {
      await link.associate(blueprint.schemas);

      // Replace the schema databases to the local db
      for (const schema of blueprint.schemas) {
        schema.database = database;

        const isExists = await this.rest.read('main', 'Schema', schema);

        if (!isExists) {
          await this.rest
            .create('main', 'Schema', schema)
            .then(() =>
              this.logger.info(
                'Schema [%s][%s] installed',
                blueprint.title,
                schema.reference,
              ),
            )
            .catch(e =>
              this.logger
                .warn(
                  'Could not create [%s][%s] schema',
                  blueprint.title,
                  schema.reference,
                )
                .warn(getErrorMessage(e)),
            );
        } else {
          this.logger.debug(
            'Schema [%s][%s] already exists',
            blueprint.title,
            schema.reference,
          );
        }
      }
    }

    for (const flow of blueprint.flows) {
      const isExists = await this.rest.read('main', 'Flow', flow);

      if (!isExists) {
        await this.rest
          .create('main', 'Flow', flow as unknown as R)
          .then(() =>
            this.logger.info(
              'Flow [%s][%s] installed',
              blueprint.title,
              flow.id,
            ),
          )
          .catch(e =>
            this.logger.warn(
              'Could not create [%s][%s] flow [%s]',
              blueprint.title,
              flow.id,
              getErrorMessage(e),
            ),
          );
      } else {
        this.logger.debug(
          'Flow [%s][%s] already exists',
          blueprint.title,
          flow.id,
        );
      }
    }

    const isBlueprintExists = await this.rest.read(
      'main',
      'Blueprint',
      blueprint,
    );

    if (!isBlueprintExists) {
      await this.rest.create('main', 'Blueprint', blueprint);

      this.logger.info('Blueprint [%s] installed', blueprint.title);
    } else {
      this.logger.info('Blueprint [%s] updated', blueprint.title);
    }

    return blueprint;
  }
}
