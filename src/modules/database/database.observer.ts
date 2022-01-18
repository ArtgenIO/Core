import { ILogger, Inject, Logger } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { Observer, On } from '../event';
import { ISchema } from '../schema';
import { IDatabase } from './interface';
import { DatabaseConnectionService } from './service/database-connection.service';

@Observer()
export class DatabaseObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(DatabaseConnectionService)
    readonly connections: DatabaseConnectionService,
  ) {}

  @On('crud.main.Schema.created')
  async handleSchemaCreate(schema: ISchema) {
    this.logger.warn(
      "Associating the [%s] schema with it's conneciton",
      schema.reference,
    );

    try {
      await this.connections.findOne(schema.database).associate([schema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
      console.error(error);
    }
  }

  @On('crud.main.Schema.updated')
  async handleSchemaUpdate(newSchema: ISchema) {
    this.logger.warn('Updating [%s] schema association', newSchema.reference);

    try {
      await this.connections.findOne(newSchema.database).associate([newSchema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
      console.error(error);
    }
  }

  @On('crud.main.Schema.deleted')
  async handleSchemaDelete(schema: ISchema) {
    this.logger.warn("Deleting [%s] schema's table", schema.reference);

    try {
      await this.connections
        .findOne(schema.database)
        .knex.schema.dropTable(schema.tableName);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
      console.error(error);
    }
  }

  @On('crud.main.Database.deleted')
  async handleDatabaseDelete(database: IDatabase) {
    this.logger.warn(
      'Database [%s] deleted, closing the connection...',
      database.ref,
    );

    try {
      const link = this.connections.findOne(database.ref);

      if (link) {
        await link.close();
      }

      this.logger.info('Link [%s] closed', database.ref);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
      console.error(error);
    }
  }
}
