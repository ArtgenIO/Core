import { ILogger, IModule, Inject, Logger, Module } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { CollectionService } from '../collection/service/collection.service';
import { DatabaseObserver } from './database.observer';
import { IConnection } from './interface';
import { Synchronizer } from './library/synchronizer';
import { ConnectionConcrete } from './provider/connection-concrete.provider';
import { ConnectionService } from './service/connection.service';
import { DatabaseService } from './service/database.service';

@Module({
  providers: [
    ConnectionConcrete,
    ConnectionService,
    DatabaseObserver,
    DatabaseService,
    Synchronizer,
  ],
})
export class DatabaseModule implements IModule {
  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(DatabaseService)
    protected databaseSvc: DatabaseService,
    @Inject(ConnectionService)
    protected connectionSvc: ConnectionService,
    @Inject(CollectionService)
    protected schemaSvc: CollectionService,
  ) {}

  /**
   * Sets up the database with the system required tables and manages
   * to initialize a valid connection for the rest of the system.
   *
   * At this point we don't have to handle the errors, because the system
   * cannot function without the "system" connection, and the kernel will
   * cancel the bootstrap with the error message.
   *
   * Custom connections may fail and those fails will be logged, but not breaking the system start.
   */
  async onStart(): Promise<void> {
    const connection = await this.connectionSvc.create(
      this.databaseSvc.getSystem(),
      this.schemaSvc.getSystem(),
    );

    this.logger.debug('Synchronizing the system resources to the database');

    // Ensure that the system schemas are available in the database.
    await this.databaseSvc.synchronize(connection);
    await this.schemaSvc.synchronize(connection);

    this.logger.debug('Loading custom resources from the database');

    const [schemas, databases] = await Promise.all([
      this.schemaSvc.findAll(),
      this.databaseSvc.findAll(),
    ]);

    const updates: Promise<IConnection | unknown>[] = [];

    // Map schemas to databases.
    for (const database of databases) {
      const associations = schemas.filter(s => s.database === database.name);

      // Connection does not exists yet, load up with the schemas.
      if (database.name !== 'system') {
        updates.push(
          this.connectionSvc
            .create(database, associations)
            .catch(e => this.logger.warn(getErrorMessage(e))),
        );
      }
      // Existing connection (system)
      else {
        updates.push(connection.associate(associations));
      }
    }

    this.logger.debug('Updating connections with their resources');

    await Promise.all(updates);
  }

  /**
   * Close the database connections.
   */
  async onStop() {
    await Promise.all(
      this.connectionSvc
        .findAll()
        .map(c =>
          c
            .close()
            .then(() =>
              this.logger.info('Connection [%s] closed', c.database.name),
            ),
        ),
    );
  }
}
