import { instantiateClass } from '@loopback/context';
import knex, { Knex } from 'knex';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { IKernel } from '../../../app/kernel';
import { ISchema } from '../../schema';
import { IDatabase } from '../interface/database.interface';
import { Connection } from '../library/connection';
import { parseDialect } from '../parser/parse-dialect';

/**
 * Responsible to create links to databases, currently only supports the ORM connections,
 * but later this will be the service managing the excel, and API like connections too.
 *
 * Just a self note, investigate this awesome looking library: https://www.js-data.io/
 * I like their way to solve the data management, maybe we can make use of it when
 * the database migrations are managed with a self adjusted library.
 */
@Service()
export class ConnectionService {
  /**
   * In memory registry for links, mapped to the database name.
   */
  protected connections = new Map<string, Connection>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('Kernel')
    readonly kernel: IKernel,
  ) {}

  /**
   * Create a connection to the given database.
   */
  async create(database: IDatabase, schemas: ISchema[]): Promise<Connection> {
    this.logger.debug('Connection [%s] creating', database.name);

    let conn: Knex;

    try {
      conn = this.createConnection(database);

      this.logger.info('Connection [%s] has connected', database.name);
    } catch (error) {
      this.logger.error(
        'Connection to the [%s] database has failed',
        database.name,
      );

      throw error;
    }

    const link = await instantiateClass(
      Connection,
      this.kernel.context,
      undefined,
      [conn, database],
    );
    await link.associate(schemas);

    this.connections.set(database.name, link);

    return link;
  }

  findByName(name: string): Connection {
    return this.connections.get(name);
  }

  findAll(): Connection[] {
    return Array.from(this.connections.values());
  }

  protected createConnection(database: IDatabase): Knex {
    const dialect = parseDialect(database.dsn);

    switch (dialect) {
      case 'sqlite':
        return knex({
          client: 'sqlite',
          connection: {
            filename: database.dsn.substr(7),
          },
        });
      case 'postgres':
        return knex({
          client: 'pg',
          connection: database.dsn,
        });
      case 'mysql':
      case 'mariadb':
        return knex({
          client: 'mysql',
          connection: database.dsn,
        });
    }

    throw new Exception(`Dialect [${dialect}] is not supported`);
  }
}
