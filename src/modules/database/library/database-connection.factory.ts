import knex, { Knex } from 'knex';
import { ILogger, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { IDatabase } from '../interface';

@Service()
export class DatabaseConnectionFactory {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  create(database: IDatabase): Knex {
    switch (database.type) {
      case 'sqlite':
        return this.createSQLiteConnection(database);
      case 'postgres':
        return this.createPostgresConnection(database);
      case 'mysql':
        return this.createMySQLConnection(database);
      case 'mariadb':
        return this.createMariaDBConnection(database);
      default:
        throw new Exception(
          `Database type [${database.type}] is not supported`,
        );
    }
  }

  protected createSQLiteConnection(connection: IDatabase): Knex {
    return knex({
      client: 'sqlite',
      connection: {
        filename: connection.dsn.substr(7),
      },
      asyncStackTraces: true,
      log: this.logger.child({ scope: `DB:${connection.name}` }),
    });
  }

  protected createPostgresConnection(connection: IDatabase): Knex {
    return knex({
      client: 'pg',
      connection: connection.dsn,
      asyncStackTraces: true,
      log: this.logger.child({ scope: `DB:${connection.name}` }),
    });
  }

  protected createMySQLConnection(connection: IDatabase): Knex {
    return knex({
      client: 'mysql',
      connection: connection.dsn,
      asyncStackTraces: true,
      log: this.logger.child({ scope: `DB:${connection.name}` }),
    });
  }

  protected createMariaDBConnection(connection: IDatabase): Knex {
    return knex({
      client: 'mysql',
      connection: connection.dsn,
      asyncStackTraces: true,
      log: this.logger.child({ scope: `DB:${connection.name}` }),
    });
  }
}
