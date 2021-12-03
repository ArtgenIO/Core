import { inject, instantiateClass } from '@loopback/context';
import { Knex } from 'knex';
import {
  IContext,
  ILogger,
  Inject,
  Logger,
  Service,
} from '../../../app/container';
import { ISchema } from '../../schema';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionFactory } from '../library/database-connection.factory';
import { DatabaseLink } from '../library/database-link';

/**
 * Responsible to create links to databases, currently only supports the ORM connections,
 * but later this will be the service managing the excel, and API like connections too.
 *
 * Just a self note, investigate this awesome looking library: https://www.js-data.io/
 * I like their way to solve the data management, maybe we can make use of it when
 * the database migrations are managed with a self adjusted library.
 */
@Service()
export class DatabaseLinkService {
  /**
   * In memory registry for links, mapped to the database name.
   */
  protected registry = new Map<string, DatabaseLink>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(DatabaseConnectionFactory)
    readonly connectionFactory: DatabaseConnectionFactory,
    @inject.context()
    readonly ctx: IContext,
  ) {}

  /**
   * Create a connection to the given database.
   */
  async create(database: IDatabase, schemas: ISchema[]): Promise<DatabaseLink> {
    this.logger.debug('Connection [%s] creating', database.name);

    let connection: Knex;

    try {
      connection = this.connectionFactory.create(database);

      this.logger.info('Connection [%s] has connected', database.name);
    } catch (error) {
      this.logger.error(
        'Connection to the [%s] database has failed',
        database.name,
      );

      throw error;
    }

    const link = await instantiateClass(DatabaseLink, this.ctx, undefined, [
      connection,
      database,
    ]);
    // Initial setup
    await link.associate(schemas);

    this.registry.set(database.name, link);

    return link;
  }

  findByName(name: string): DatabaseLink {
    return this.registry.get(name);
  }

  findAll(): DatabaseLink[] {
    return Array.from(this.registry.values());
  }
}
