import { ILogger, Inject, Logger, Service } from '@hisorange/kernel';
import { Model, ModelClass } from 'objection';
import { IDatabase } from '../../models/database.interface';
import { ISchema } from '../../models/schema.interface';
import { SystemBlueprint } from '../blueprints/system.blueprint';
import { IDatabaseConnection } from '../types/database-connection.interface';
import { SchemaRef } from '../types/system-ref.enum';
import { DatabaseConnectionService } from './database-connection.service';
import { SchemaService } from './schema.service';

type DatabaseModel = IDatabase & Model;

@Service()
export class DatabaseService {
  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(SchemaService)
    readonly schemaService: SchemaService,
    @Inject(DatabaseConnectionService)
    readonly connectionService: DatabaseConnectionService,
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
    const connection = await this.connectionService.connect(
      this.getMainDatabase(),
      this.getSystemSchemas(),
    );

    this.logger.debug('Synchronizing schemas to the [main] database');

    // Ensure that the system schemas are available in the database.
    await this.upsertDatabase(connection.database);

    this.logger.debug('Loading custom resources from the database');
    const [schemas, databases] = await Promise.all([
      this.schemaService.fetchAll(),
      this.findAll(),
    ]);

    const updates: Promise<IDatabaseConnection | unknown>[] = [];

    // Map schemas to databases.
    for (const database of databases) {
      const associations = schemas.filter(s => s.database === database.ref);

      // Connection does not exists yet, load up with the schemas.
      if (database.ref !== 'main') {
        updates.push(
          this.connectionService.connect(database, associations).catch(e => {
            this.logger.warn(e?.message);
            console.warn(e);
          }),
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
      this.connectionService
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
   * Fetch the database connection records from the database.
   */
  async findAll(): Promise<IDatabase[]> {
    return (await this.model.query()).map(db => db.$toJson());
  }

  /**
   * Upsert the database connection with the persistent database connections table.
   */
  protected async upsertDatabase(database: IDatabase): Promise<void> {
    let record = await this.model.query().findById(database.ref);

    if (!record) {
      await this.model.query().insertAndFetch(database);
    } else {
      await record.$set(database).$query().update();
    }
  }

  /**
   * Shorthand to access the "Database" model.
   * We cannot inject this, because it does not exists when the service is created.
   */
  protected get model(): ModelClass<DatabaseModel> {
    return this.schemaService.getSysModel<DatabaseModel>(SchemaRef.DATABASE);
  }

  /**
   * Generates a database record based on the ARTGEN_DATABASE_DSN environment.
   */
  protected getMainDatabase(): IDatabase {
    return {
      title: 'Main',
      ref: 'main',
      dsn: process.env.ARTGEN_DATABASE_DSN ?? 'sqlite::memory:',
    };
  }

  /**
   * Accessor to acquire the system's schemas from the packaged system blueprint.
   */
  protected getSystemSchemas(): ISchema[] {
    return SystemBlueprint.schemas;
  }
}
