import { Connection, ConnectionManager, EntitySchema } from 'typeorm';
import { SchemaService } from '../../../content/schema/service/schema.service';
import { getErrorMessage } from '../../app/util/extract-error';
import { IContext, ILogger, Inject, Logger } from '../../container';
import { IConnection } from '../interface/connection.interface';

export class ConnectionService {
  constructor(
    @Inject.context()
    readonly ctx: IContext,
    @Inject('providers.ConnectionManagerProvider')
    readonly connectionManager: ConnectionManager,
    @Inject('classes.SchemaService')
    readonly schema: SchemaService,
    @Logger()
    protected logger: ILogger,
  ) {}

  /**
   * Create a connection to the named database.
   * Will guess the database type from the URL and store it for reuse
   */
  async connect(
    connection: Omit<IConnection, 'id'>,
    schemas: EntitySchema[],
  ): Promise<Connection | false> {
    if (this.connectionManager.has(connection.name)) {
      /*const con = this.connectionManager.get(connection.name);

      // Inject the entities.
      (con.options.entities as unknown) = schemas;

      const changeQueries = await con.driver.createSchemaBuilder().log();
      const isInSync = changeQueries.upQueries.length === 0;

      if (!isInSync) {
        this.logger.warn(
          'Database [%s] is out of sync, updating now',
          connection.name,
        );
        await con.synchronize(false);
      } else {
        this.logger.info('Everthing in sync');
      }

      return con;*/

      if (connection.type === 'sqljs') {
        return this.connectionManager.get(connection.name);
      }
      this.logger.info('Closing the [%s] connection', connection.name);
      await this.connectionManager.get(connection.name).close();
    }

    let link: Connection;

    this.logger.debug(
      'Creating connection to [%s] at [%s]',
      connection.name,
      connection.url,
    );

    switch (connection.type) {
      case 'mongodb':
        link = this.createMongoConnection(connection, schemas);
        break;
      case 'postgres':
        link = this.createPostgresConnection(connection, schemas);
        break;
      case 'mysql':
        link = this.createMySQLConnection(connection, schemas);
        break;
      case 'sqljs':
        link = this.createSqlJSConenction(connection, schemas);
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

    this.logger.info('Database [%s] connected', connection.name);

    return link;
  }

  protected createSqlJSConenction(
    connection: Omit<IConnection, 'id'>,
    schemas: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      type: 'sqljs',
      entities: schemas,
      synchronize: true,
    });
  }

  protected createMongoConnection(
    connection: Omit<IConnection, 'id'>,
    schemas: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'mongodb',
      loggerLevel: 'info',
      entities: schemas,
      synchronize: true,
      useUnifiedTopology: true,
    });
  }

  protected createPostgresConnection(
    connection: Omit<IConnection, 'id'>,
    schemas: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'postgres',
      entities: schemas,
      synchronize: true,
    });
  }

  protected createMySQLConnection(
    connection: Omit<IConnection, 'id'>,
    schemas: EntitySchema[],
  ): Connection {
    return this.connectionManager.create({
      name: connection.name,
      url: connection.url,
      type: 'mysql',
      timezone: 'UTC',
      entities: schemas,
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
