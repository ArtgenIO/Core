import { Constructor } from '@loopback/context';
import config from 'config';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { ConnectionManager } from 'typeorm';
import { CollectionEntity } from '../../content/collection/collection/collection.collection';
import { CollectionService } from '../../content/collection/service/collection.service';
import { WorkflowEntity } from '../../management/workflow/collection/workflow.collection';
import { IApplication } from '../app/application.interface';
import { ILogger, IModule, Logger, Module } from '../container';
import { DatabaseEntity } from './collection/database.collection';
import { IConnection } from './interface/connection.interface';
import { ConnectionManagerProvider } from './providers/connection-manager.provider';
import { EphemeralDatabaseProvider } from './providers/ephemeral-database.provider';
import { ConnectionService } from './service/connection.service';

@Module({
  providers: [
    ConnectionManagerProvider,
    ConnectionService,
    EphemeralDatabaseProvider,
  ],
})
export class DatabaseModule implements IModule {
  /**
   * Store the reference to the ephemeral server.
   */
  protected ephemeralServer: MongoMemoryServer | null = null;

  constructor(
    @Logger()
    protected logger: ILogger,
  ) {}

  /**
   * Prepare the database
   */
  async onStart(app: IApplication): Promise<void> {
    await this.createSystemConnection(app);

    await (
      await app.context.get<CollectionService>('classes.CollectionService')
    ).prepare();
    this.logger.info('Service [collection] is ready');
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

    if (this.ephemeralServer) {
      await this.ephemeralServer.stop();
    }
  }

  protected async createSystemConnection(app: IApplication) {
    // System database URL
    let url: string;

    // Ephemeral database used, so we start one
    if (app.isEphemeral) {
      this.ephemeralServer = await app.context.get<MongoMemoryServer>(
        'providers.EphemeralDatabaseProvider',
      );

      url = this.ephemeralServer.getUri();

      this.logger.info('Ephemeral database URL is [%s]', url);
    } else {
      url = config.get<string>('database.url');
    }

    const service = await app.context.get<ConnectionService>(
      'classes.ConnectionService',
    );
    const type = service.getDatabaseTypeFromUrl(url);

    if (!type) {
      throw new Error(`Could not determine the database type from [${url}]`);
    }

    const connection: Omit<IConnection, 'id'> = { name: 'system', type, url };
    // Register system collections
    const collections: Constructor<unknown>[] = [
      CollectionEntity,
      DatabaseEntity,
      WorkflowEntity,
    ];

    await service.connect(connection, collections);
    await service.create(connection);

    this.logger.info('Connection [%s] is ready to be abused!', connection.name);
  }
}
