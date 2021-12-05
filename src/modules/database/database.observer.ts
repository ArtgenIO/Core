import { ILogger, Inject, Logger } from '../../app/container';
import { getErrorMessage } from '../../app/kernel';
import { ICollection } from '../collection';
import { CollectionService } from '../collection/service/collection.service';
import { Observer, On } from '../event';
import { IDatabase } from './interface';
import { ConnectionService } from './service/connection.service';

@Observer()
export class DatabaseObserver {
  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(ConnectionService)
    readonly linkService: ConnectionService,
    @Inject(CollectionService)
    readonly schemaService: CollectionService,
  ) {}

  @On('crud.system.Schema.created')
  async handleSchemaCreate(schema: ICollection) {
    this.logger.warn('New schema created! [%s]', schema.reference);

    try {
      const link = this.linkService.findOne(schema.database);

      this.schemaService.registry.push(schema); // TODO remove this, and move it to a centralized way, we can't have side effects here
      await link.associate([schema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }

  @On('crud.system.Schema.updated')
  async handleSchemaUpdate(schema: ICollection) {
    this.logger.warn('Schema changed! [%s]', schema.reference);

    try {
      await this.linkService.findOne(schema.database).associate([schema]);
    } catch (error) {
      this.logger.error(getErrorMessage(error));
    }
  }

  @On('crud.system.Schema.deleted')
  async handleSchemaDelete(schema: ICollection) {
    this.logger.warn('Schema delete! [%s]', schema.reference);

    try {
      const link = this.linkService.findOne(schema.database);
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
      const link = this.linkService.findOne(database.name);

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
