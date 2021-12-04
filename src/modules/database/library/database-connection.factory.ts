import knex, { Knex } from 'knex';
import { ILogger, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { IDatabase } from '../interface';
import { parseDialect } from './parser/parse-dialect';

@Service()
export class DatabaseConnectionFactory {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  create(database: IDatabase): Knex {
    const dialect = parseDialect(database.dsn);

    switch (dialect) {
      case 'sqlite':
        return this.createSQLiteConnection(database);
      case 'postgres':
        return this.createPostgresConnection(database);
      case 'mysql':
        return this.createMySQLConnection(database);
      case 'mariadb':
        return this.createMariaDBConnection(database);
    }

    throw new Exception(`Dialect [${dialect}] is not supported`);
  }

  protected createSQLiteConnection(connection: IDatabase): Knex {
    return knex({
      client: 'sqlite',
      connection: {
        filename: connection.dsn.substr(7),
      },
    });
  }

  protected createPostgresConnection(connection: IDatabase): Knex {
    return knex({
      client: 'pg',
      connection: connection.dsn,
    });
  }

  protected createMySQLConnection(connection: IDatabase): Knex {
    return knex({
      client: 'mysql',
      connection: connection.dsn,
    });
  }

  protected createMariaDBConnection(connection: IDatabase): Knex {
    return knex({
      client: 'mysql',
      connection: connection.dsn,
    });
  }
}
