import { Constructor } from '@loopback/context';
import { Connection, ConnectionManager, DatabaseType } from 'typeorm';
import { getErrorMessage } from '../../app/util/extract-error';
import { IContext, ILogger, Inject, Logger } from '../../container';
import { DatabaseEntity } from '../collection/database.collection';
import { IConnection } from '../interface/connection.interface';

export class ConnectionService {
  constructor(
    @Inject.context()
    readonly ctx: IContext,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
    @Logger()
    protected logger: ILogger,
  ) {}

  /**
   * Get the database type for connection configuration
   */
  getDatabaseTypeFromUrl(url: string): DatabaseType | false {
    let protocol: string;

    try {
      protocol = new URL(url).protocol.replace(':', '').toLowerCase();
    } catch (error) {
      return false;
    }

    if (protocol === 'postgresql') {
      protocol = 'postgres';
    }

    if (protocol === 'mongodb+srv') {
      protocol = 'mongodb';
    }

    if (protocol === 'mariadb') {
      protocol = 'mysql';
    }

    if (['mongodb', 'postgres', 'mysql'].includes(protocol)) {
      return protocol as DatabaseType;
    } else {
      return false;
    }
  }

  /**
   * Create a connection to the named database.
   * Will guess the database type from the URL and store it for reuse
   */
  async connect(
    connection: Omit<IConnection, 'id'>,
    collections: Constructor<unknown>[],
  ): Promise<Connection | false> {
    let link: Connection;

    this.logger.debug('Creating connection to [%s]', connection.name);

    switch (connection.type) {
      case 'mongodb':
        link = this.createMongoConnection(connection, collections);
        break;
      case 'postgres':
        link = this.createPostgresConnection(connection, collections);
        break;
      case 'mysql':
        link = this.createMySQLConnection(connection, collections);
        break;
      default:
        this.logger.error(
          'Database type [%s] is currently not supported',
          connection.type,
        );
        return false;
    }

    this.logger.info('Database [%s] connection initialized', connection.name);

    try {
      await link.connect();
    } catch (error) {
      this.logger.error(
        'Connection to the [%s] database has failed',
        connection.name,
      );
      this.logger.error(getErrorMessage(error));

      return false;
    }

    for (const collection of collections) {
      const key = `collection.${connection.name}.${collection.name}`;

      if (!this.ctx.contains(key)) {
        this.logger.info('Storing reference [%s] for collection', key);

        this.ctx.bind(key).to(collection);
      }
    }

    this.logger.info('Database [%s] connected', connection.name);

    return link;
  }

  protected createMongoConnection(
    connection: Omit<IConnection, 'id'>,
    collections: Constructor<unknown>[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'mongodb',
      loggerLevel: 'info',
      entities: collections,
      synchronize: true,
      useUnifiedTopology: true,
    });
  }

  protected createPostgresConnection(
    connection: Omit<IConnection, 'id'>,
    collections: Constructor<unknown>[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'postgres',
      entities: collections,
      synchronize: true,
    });
  }

  protected createMySQLConnection(
    connection: Omit<IConnection, 'id'>,
    collections: Constructor<unknown>[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'mysql',
      timezone: 'UTC',
      entities: collections,
      synchronize: true,
    });
  }

  /**
   * Store the connection in the ArtgenDatabases collection so we can reconnect to it.
   */
  async create(connection: Omit<IConnection, 'id'>) {
    const link = this.connectionManager.get('system');
    const repository = link.getRepository(DatabaseEntity);
    let record: DatabaseEntity = await repository.findOne({
      name: connection.name,
    });

    if (!record) {
      record = new DatabaseEntity();
      record.name = connection.name;
      record.tags = ['active'];
    }

    record.type = connection.type;
    record.url = connection.url;

    await repository.save(record);

    return record;
  }
}
