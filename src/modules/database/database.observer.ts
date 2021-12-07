import { ILogger, Inject, Logger } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { Observer, On } from '../event';
import { ISchema } from '../schema';
import { SchemaService } from '../schema/service/schema.service';
import { IDatabase } from './interface';
import { DatabaseConnectionService } from './service/database-connection.service';

@Observer()
export class DatabaseObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
    @Inject(SchemaService)
    readonly schemaService: SchemaService,
  ) {}

  @On('crud.system.Schema.created')
  async handleSchemaCreate(schema: ISchema) {
    this.logger.warn('New schema created! [%s]', schema.reference);

    try {
      const link = this.connections.findOne(schema.database);

      this.schemaService.registry.push(schema); // TODO remove this, and move it to a centralized way, we can't have side effects here
      await link.associate([schema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }

  @On('crud.system.Schema.updated')
  async handleSchemaUpdate(schema: ISchema) {
    this.logger.warn('Schema changed! [%s]', schema.reference);

    try {
      await this.connections.findOne(schema.database).associate([schema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }

  @On('crud.system.Schema.deleted')
  async handleSchemaDelete(schema: ISchema) {
    this.logger.warn('Schema delete! [%s]', schema.reference);

    try {
      const link = this.connections.findOne(schema.database);
      // Delete the table
      await link.knex.schema.dropTable(schema.tableName);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }

  @On('crud.system.Database.deleted')
  async handleDatabaseDelete(database: IDatabase) {
    this.logger.warn('Database [%s] deleted', database.name);

    try {
      const link = this.connections.findOne(database.name);

      if (link) {
        await link.close();
      }

      this.logger.info('Link [%s] closed', database.name);

      // Refresh the schema cache
      await this.schemaService.findAll();
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }
}
