import config from 'config';
import { ConnectionManager, EntitySchema } from 'typeorm';
import { SchemaService } from '../../content/schema/service/schema.service';
import { schemaToEntity } from '../../content/schema/util/schema-to-entity';
import { IApplication } from '../app/application.interface';
import { ILogger, IModule, Logger, Module } from '../container';
import { IConnection } from './interface/connection.interface';
import { DatabaseInsertLambda } from './lambda/insert.lambda';
import { getDatabaseTypeFromUrl } from './library/get-database-type';
import { ConnectionManagerProvider } from './providers/connection-manager.provider';
import { ConnectionService } from './service/connection.service';

@Module({
  providers: [
    ConnectionManagerProvider,
    ConnectionService,
    DatabaseInsertLambda,
  ],
})
export class DatabaseModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  /**
   * Prepare the database
   */
  async onStart(app: IApplication): Promise<void> {
    // Determine what kind of database we use for the system collections
    this.setSystemDatabaseMeta(app);

    const schemaService = await app.context.get<SchemaService>(
      'classes.SchemaService',
    );
    const offlineSchemas = schemaService.getSystemSchemas().map(r => r.entity);

    // Phase 1, create the default connection, with offline schemas
    await this.createSystemConnection(app, offlineSchemas);
    // Phase 2, load the dynamic schemas
    await schemaService.synchronizeOfflineSchemas();
    // Phase 3 reconnect to databases with the full resource list
    const schemas = await schemaService.findAll();

    if (1) {
      await this.createSystemConnection(
        app,
        schemas.map(schema =>
          schemaToEntity(schema, app.context.getSync('database.system.type')),
        ),
      );
    }
  }

  async onStop(app: IApplication) {
    const connectionManager = await app.context.get<ConnectionManager>(
      'providers.ConnectionManagerProvider',
    );

    // Close open connections
    await Promise.all(
      connectionManager.connections.map(c =>
        c.isConnected
          ? c
              .close()
              .then(() => this.logger.info('Connection [%s] closed', c.name))
          : undefined,
      ),
    );
  }

  protected setSystemDatabaseMeta(app: IApplication) {
    const url: string = app.isEphemeral
      ? 'sqljs'
      : config.get<string>('database.url');

    app.context.bind('database.system.url').to(url);
    app.context.bind('database.system.type').to(getDatabaseTypeFromUrl(url));
  }

  protected async createSystemConnection(
    app: IApplication,
    schemas: EntitySchema[],
  ) {
    const connectionService = await app.context.get<ConnectionService>(
      'classes.ConnectionService',
    );

    const connection: Omit<IConnection, 'id'> = {
      name: 'system',
      type: app.context.getSync('database.system.type'),
      url: app.context.getSync('database.system.url'),
    };

    await connectionService.connect(connection, schemas);
    await connectionService.create(connection);

    this.logger.info('Connection [%s] is ready to be abused!', connection.name);
  }
}
