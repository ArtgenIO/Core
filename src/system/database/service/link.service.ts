import { EventEmitter2 } from 'eventemitter2';
import { Sequelize } from 'sequelize';
import { ISchema } from '../../../content/schema';
import { ILogger, Inject, Logger, Service } from '../../container';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionFactory } from '../library/database-connection.factory';
import { Link } from '../library/link';

/**
 * Responsible to create links to databases, currently only supports the TypeORM connection,
 * but later this will be the service managing the excel, and API like connections too.
 */
@Service()
export class LinkService {
  /**
   * Quick hash map to store and lookup links.
   */
  protected registry = new Map<string, Link>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(EventEmitter2)
    readonly event: EventEmitter2,
    @Inject(DatabaseConnectionFactory)
    readonly connectionFactory: DatabaseConnectionFactory,
  ) {
    this.onSchemaCreated();
  }

  /**
   * Listen for schema create event, and update the link when it happened.
   */
  protected onSchemaCreated() {
    this.event.on('schema.created', async (schema: ISchema) => {
      this.logger.info(
        'Schema change detected! Updating the link [%s]',
        schema.database,
      );
    });
  }

  /**
   * Create a connection to the given database.
   */
  async create(database: IDatabase, schemas: ISchema[]): Promise<Link> {
    this.logger.debug('Connection [%s] creating', database.name);

    const connection: Sequelize = this.connectionFactory.create(database);

    try {
      await connection.validate();

      this.logger.info('Connection [%s] has connected', database.name);
    } catch (error) {
      this.logger.error(
        'Connection to the [%s] database has failed',
        database.name,
      );

      throw error;
    }

    const link = new Link(connection, database);
    await link.manage(schemas);

    this.registry.set(database.name, link);

    return link;
  }

  findByName(name: string): Link {
    return this.registry.get(name);
  }

  findAll(): Link[] {
    return Array.from(this.registry.values());
  }
}
