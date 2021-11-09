import { Sequelize } from 'sequelize';
import { ISchema } from '../../../content/schema';
import { ILogger, Inject, Logger, Service } from '../../container';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionFactory } from '../library/database-connection.factory';
import { Link } from '../library/link';

/**
 * Responsible to create links to databases, currently only supports the ORM connections,
 * but later this will be the service managing the excel, and API like connections too.
 *
 * Just a self note, investigate this awesome looking library: https://www.js-data.io/
 * I like their way to solve the data management, maybe we can make use of it when
 * the database migrations are managed with a self adjusted library.
 */
@Service()
export class LinkService {
  /**
   * In memory registry for links, mapped to the database name.
   */
  protected registry = new Map<string, Link>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(DatabaseConnectionFactory)
    readonly connectionFactory: DatabaseConnectionFactory,
  ) {}

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
