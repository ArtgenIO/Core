import { Constructor } from '@loopback/context';
import knex, { Knex } from 'knex';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IKernel } from '../../../app/kernel';
import { ISchema } from '../../schema';
import { IConnection } from '../interface';
import { IDatabase } from '../interface/database.interface';
import { parseDialect } from '../library/parser/parse-dialect';
import { ConnectionConcrete } from '../provider/connection-concrete.provider';

@Service()
export class ConnectionService {
  /**
   * Connections mapped to their database name.
   */
  protected connections = new Map<string, IConnection>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('Kernel')
    readonly kernel: IKernel,
    @Inject(ConnectionConcrete)
    readonly connectionConcrete: Constructor<IConnection>,
  ) {}

  /**
   * Create a connection to the given database, and synchornize the given schemas to it.
   */
  async create(database: IDatabase, schemas: ISchema[]): Promise<IConnection> {
    const connection = await this.kernel.create(this.connectionConcrete, [
      this.initKnex(database.dsn),
      database,
    ]);

    // Store the connection early, we may call on it with the schema manager.
    this.connections.set(database.name, connection);

    // Runs the synchornization on association.
    return await connection.associate(schemas);
  }

  /**
   * Get the connection for the given database name.
   */
  findOne(name: string): IConnection {
    return this.connections.get(name);
  }

  /**
   * Get all connection as an array.
   */
  findAll(): IConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Create the Knex instance based on the dialect.
   */
  protected initKnex(dsn: string): Knex {
    switch (parseDialect(dsn)) {
      case 'sqlite':
        return knex({
          client: 'sqlite',
          connection: {
            filename: dsn.substr(7),
          },
        });
      case 'postgres':
        return knex({
          client: 'pg',
          connection: dsn,
        });
      case 'mysql':
      case 'mariadb':
      default:
        return knex({
          client: 'mysql2',
          connection: dsn,
        });
    }
  }
}
