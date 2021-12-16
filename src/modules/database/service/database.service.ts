import { Model } from 'objection';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { getErrorMessage } from '../../../app/kernel';
import { SchemaService } from '../../schema/service/schema.service';
import { IDatabaseConnection } from '../interface';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionService } from './database-connection.service';

type DatabaseModel = IDatabase & Model;

@Service()
export class DatabaseService {
  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(SchemaService)
    readonly schemaSvc: SchemaService,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
  ) {}

  /**
   * Sets up the database with the system required tables and manages
   * to initialize a valid connection for the rest of the system.
   *
   * At this point we don't have to handle the errors, because the system
   * cannot function without the "main" connection, and the kernel will
   * cancel the bootstrap with the error message.
   *
   * Custom connections may fail and those fails will be logged, but not breaking the system start.
   */
  async bootstrap() {
    const connection = await this.connections.create(
      this.getMainDatabase(),
      this.schemaSvc.getSystem(),
    );

    this.logger.debug('Synchronizing the system resources to the database');

    // Ensure that the system schemas are available in the database.
    await this.synchronize(connection);
    await this.schemaSvc.synchronize(connection);

    this.logger.debug('Loading custom resources from the database');

    const [schemas, databases] = await Promise.all([
      this.schemaSvc.findAll(),
      this.findAll(),
    ]);

    const updates: Promise<IDatabaseConnection | unknown>[] = [];

    // Map schemas to databases.
    for (const database of databases) {
      const associations = schemas.filter(s => s.database === database.ref);

      // Connection does not exists yet, load up with the schemas.
      if (database.ref !== 'main') {
        updates.push(
          this.connections
            .create(database, associations)
            .catch(e => this.logger.warn(getErrorMessage(e))),
        );
      }
      // Existing connection (main)
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
  async shutdown() {
    await Promise.all(
      this.connections
        .findAll()
        .map(c =>
          c
            .close()
            .then(() =>
              this.logger.info('Connection [%s] closed', c.database.ref),
            ),
        ),
    );
  }

  /**
   * Synchronize a link's database into the database which stores the connections.
   */
  async synchronize(link: IDatabaseConnection) {
    const model = this.schemaSvc.getModel<DatabaseModel>('main', 'Database');

    let record = await model.query().findById(link.database.ref);

    if (!record) {
      record = await model.query().insertAndFetch(link.database);
    } else {
      record = record.$set(link.database);

      await record.$query().update();
    }
  }

  /**
   * Fetch the newest schemas from the database, and use this opportunity to
   * ensure the local cache is up to date.
   */
  async findAll(): Promise<IDatabase[]> {
    return (
      await this.schemaSvc.getModel<DatabaseModel>('main', 'Database').query()
    ).map(db => db.$toJson());
  }

  /**
   * Generates a database record based on the environment variables.
   * Database type is auto extracted from the DSN.
   */
  getMainDatabase(): IDatabase {
    return {
      title: 'Main',
      ref: 'main',
      dsn: process.env.ARTGEN_DATABASE_DSN ?? 'sqlite::memory:',
    };
  }
}
