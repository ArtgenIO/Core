import { ConnectionManager } from 'typeorm';
import { CollectionService } from '../../content/collection/service/collection.service';
import { IApplication } from '../app/application.interface';
import { ILogger, IModule, Logger, Module } from '../container';
import { ConnectionManagerProvider } from './providers/connection-manager.provider';
import { DatabaseService } from './service/database.service';

@Module({
  providers: [ConnectionManagerProvider, DatabaseService],
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
    const dbService = await app.context.get<DatabaseService>(
      'classes.DatabaseService',
    );
    await dbService.prepare();

    this.logger.info('Database service is ready');

    const collService = await app.context.get<CollectionService>(
      'classes.CollectionService',
    );

    await collService.prepare();

    this.logger.info('Collection service is ready');
  }

  async onStop(app: IApplication) {
    const connectionManager = await app.context.get<ConnectionManager>(
      'providers.ConnectionManagerProvider',
    );

    // Close open connections
    await Promise.all(
      connectionManager.connections.map(c =>
        c.isConnected ? c.close() : undefined,
      ),
    );
  }
}
