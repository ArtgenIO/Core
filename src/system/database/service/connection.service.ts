import { EventEmitter2 } from 'eventemitter2';
import { Connection, ConnectionManager, EntitySchema } from 'typeorm';
import { ISchema } from '../../../content/schema';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { getErrorMessage } from '../../app/util/extract-error';
import { IContext, ILogger, Inject, Logger, Service } from '../../container';
import { IConnection } from '../interface/connection.interface';

@Service()
export class ConnectionService {
  readonly connections = new Map<string, Omit<IConnection, 'id'>>();

  constructor(
    @Inject.context()
    readonly ctx: IContext,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
    @Inject('classes.SchemaService')
    readonly schema: SchemaService,
    @Logger()
    protected logger: ILogger,
    @Inject('providers.EventHandlerProvider')
    readonly event: EventEmitter2,
  ) {
    this.event.on('content.schema.*', async (schema: ISchema) => {
      this.logger.info(
        'Content schema changed! Subject schema [%s]',
        schema.reference,
      );

      const entities = this.schema
        .findByDatabase(schema.database)
        .map(r => r.entity);

      this.logger.info('Gathered the entities');
      const connection = this.connections.get(schema.database);
      this.logger.info('Got the connection [%s]', connection.name);

      this.logger.info('Reconnecting');
      await this.connect(connection, entities);
      this.logger.info('Connection is updated');
    });
  }

  /**
   * Create a connection to the named database.
   * Will guess the database type from the URL and store it for reuse
   */
  async connect(
    connection: Omit<IConnection, 'id'>,
    entities: EntitySchema[],
  ): Promise<Connection | false> {
    if (this.connectionManager.has(connection.name)) {
      const con = this.connectionManager.get(connection.name);

      this.logger.info('Injecting the entities');
      console.log(entities.map(e => e.options.name));

      // Inject the entities.
      (con.options.entities as unknown) = entities;
      con['buildMetadatas']();
      // END OF HACK :D

      await con.synchronize(false);
      this.logger.info('Everthing in sync');

      return con;
    }

    let link: Connection;

    this.logger.debug(
      'Creating connection to [%s] at [%s]',
      connection.name,
      connection.url,
    );

    switch (connection.type) {
      case 'postgres':
        link = this.createPostgresConnection(connection, entities);
        break;
      case 'mysql':
        link = this.createMySQLConnection(connection, entities);
        break;
      case 'sqlite':
        link = this.createSQLiteConnection(connection, entities);
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

    if (!this.connections.has(connection.name)) {
      this.connections.set(connection.name, connection);
    }

    this.logger.info('Database [%s] connected', connection.name);

    return link;
  }

  protected createSQLiteConnection(
    connection: Omit<IConnection, 'id'>,
    entities: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      database: connection.url,
      type: 'sqlite',
      logging: 'all',
      entities,
      synchronize: true,
    });
  }

  protected createPostgresConnection(
    connection: Omit<IConnection, 'id'>,
    entities: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'postgres',
      logging: ['error', 'warn', 'migration'],
      entities,
      synchronize: true,
    });
  }

  protected createMySQLConnection(
    connection: Omit<IConnection, 'id'>,
    entities: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'mysql',
      timezone: 'UTC',
      entities,
      synchronize: true,
    });
  }

  /**
   * Store the connection in the ArtgenDatabases schemas so we can reconnect to it.
   */
  async create(connection: Omit<IConnection, 'id'>) {
    const repository = this.schema.getRepository('system', 'Database');
    let record = await repository.findOne({
      name: connection.name,
    } as any);

    if (!record) {
      record = repository.create(connection);
    }

    record.type = connection.type;
    record.url = connection.url;

    await repository.save(record);

    this.ctx.bind(`database.${connection.name}.type`).to(connection.type);
    this.ctx.bind(`database.${connection.name}.url`).to(connection.url);

    return record;
  }
}
