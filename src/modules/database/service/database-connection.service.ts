import { Constructor } from '@loopback/context';
import knex, { Knex } from 'knex';
import { UnsupportedDialect } from '..';
import { ILogger, Inject, Logger, Service } from '../../../app/container';
import { IKernel } from '../../../app/kernel';
import { ISchema } from '../../schema';
import { BucketKey } from '../../telemetry/interface/bucket-key.enum';
import { TelemetryService } from '../../telemetry/telemetry.service';
import { Dialect, IDatabaseConnection } from '../interface';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionConcrete } from '../provider/connection-concrete.provider';

@Service()
export class DatabaseConnectionService {
  /**
   * Connections mapped to their database name.
   */
  protected connections = new Map<string, IDatabaseConnection>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject('Kernel')
    readonly kernel: IKernel,
    @Inject(DatabaseConnectionConcrete)
    readonly connectionConcrete: Constructor<IDatabaseConnection>,
    @Inject(TelemetryService)
    readonly telemetry: TelemetryService,
  ) {}

  /**
   * Create a connection to the given database, and synchornize the given schemas to it.
   */
  async connect(
    database: IDatabase,
    schemas: ISchema[],
  ): Promise<IDatabaseConnection> {
    const dialect = this.getDialectFromDSN(database.dsn);
    const knex = this.initKnex(database.dsn, dialect);
    const connection = await this.kernel.create(this.connectionConcrete, [
      knex,
      database,
      dialect,
    ]);

    knex.on('query', () => this.telemetry.record(BucketKey.DB_QUERY));

    // Store the connection early, we may call on it with the schema manager.
    this.connections.set(database.ref, connection);

    // Runs the synchornization on association.
    await connection.associate(schemas);

    return connection;
  }

  /**
   * Get the connection for the given database name.
   */
  findOne(name: string): IDatabaseConnection {
    return this.connections.get(name);
  }

  /**
   * Get all connection as an array.
   */
  findAll(): IDatabaseConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Create the Knex instance based on the dialect.
   */
  protected initKnex(dsn: string, dialect: Dialect): Knex {
    switch (dialect) {
      case 'sqlite':
        return knex({
          client: 'sqlite',
          connection: {
            filename: dsn.substring(7),
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

  getDialectFromDSN(dsn: string): Dialect {
    let protocol: string = new URL(dsn).protocol.replace(':', '').toLowerCase();

    if (protocol === 'postgresql') {
      protocol = 'postgres';
    }

    if (['postgres', 'mysql', 'mariadb', 'sqlite'].includes(protocol)) {
      return protocol as Dialect;
    } else {
      throw new UnsupportedDialect(`Unknown dialect [${protocol}]`);
    }
  }
}
