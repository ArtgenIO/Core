import { ILogger, Inject, Logger, Service } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { DatabaseConnectionService } from '../database/service/database-connection.service';
import { RestService } from '../rest/service/rest.service';
import { SchemaRef } from '../schema/interface/system-ref.enum';
import { IBlueprint } from './interface/blueprint.interface';
import { ArtgenBlueprintProvider } from './provider/artgen-blueprint.provider';

@Service()
export class BlueprintService {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(RestService)
    readonly rest: RestService,
    @Inject(ArtgenBlueprintProvider)
    readonly artgenBlueprint: IBlueprint,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
  ) {}

  async seed() {
    const exists = await this.rest.read('main', SchemaRef.BLUEPRINT, {
      id: this.artgenBlueprint.id,
    });

    if (!exists) {
      await this.install('main', this.artgenBlueprint);
    }
  }

  async install(database: string, blueprint: IBlueprint) {
    // Global db reference
    blueprint.database = database;

    const link = this.connections.findOne(database);
    const existingSchemas = link.getSchemas();
    const skippedSchemas = new Set<string>();

    // Has content to install
    // TODO dedupe and order it in dependency order to ensure resources are installed before their dependents.
    if (blueprint?.content) {
      for (const schemaRef in blueprint.content) {
        if (!existingSchemas.some(s => s.reference === schemaRef)) {
          skippedSchemas.add(schemaRef);

          this.logger.info(
            'Content for [%s] blueprint delayed on the [%s] schema',
            blueprint.title,
            schemaRef,
          );
          continue;
        }

        if (
          Object.prototype.hasOwnProperty.call(blueprint.content, schemaRef)
        ) {
          const rows = blueprint.content[schemaRef];

          for (const row of rows) {
            const isExists = await this.rest.read(database, schemaRef, row);

            if (!isExists) {
              await this.rest.create(database, schemaRef, row);
            } else {
              await this.rest.update(database, schemaRef, row, row);
            }
          }
        }
      }
    }

    const installedSchemas = new Set<string>();

    // Preload the schemas before they are injected one by one.
    if (blueprint?.schemas && blueprint.schemas.length) {
      await link.associate(blueprint.schemas);

      // Replace the schema databases to the local db
      for (const schema of blueprint.schemas) {
        schema.database = database;

        const isExists = await this.rest.read('main', SchemaRef.SCHEMA, schema);

        if (!isExists) {
          installedSchemas.add(schema.reference);

          await this.rest
            .create('main', SchemaRef.SCHEMA, schema)
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

    // Install content which was dependent.
    if (skippedSchemas.size) {
      for (const schemaRef of skippedSchemas.values()) {
        if (!installedSchemas.has(schemaRef)) {
          this.logger.error(
            'Skipping on content for [%s] schema does not exists',
            schemaRef,
          );
          continue;
        }

        const rows = blueprint.content[schemaRef];

        this.logger.info(
          'Installing [%d] record for [%s] blueprint into the [%s] schema',
          rows.length,
          blueprint.title,
          schemaRef,
        );

        for (const row of rows) {
          const isExists = await this.rest.read(database, schemaRef, row);

          if (!isExists) {
            await this.rest.create(database, schemaRef, row);
          } else {
            //await this.rest.update(database, schemaRef, row, row);
          }
        }
      }
    }

    const isBlueprintExists = await this.rest.read(
      'main',
      SchemaRef.BLUEPRINT,
      blueprint,
    );

    if (!isBlueprintExists) {
      await this.rest.create('main', SchemaRef.BLUEPRINT, blueprint);

      this.logger.info('Blueprint [%s] installed', blueprint.title);
    } else {
      this.logger.info('Blueprint [%s] updated', blueprint.title);
    }

    return blueprint;
  }
}
