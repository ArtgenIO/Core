import { Sequelize } from 'sequelize';
import { ILogger, Logger, Service } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { IDatabase } from '../interface';

@Service()
export class DatabaseConnectionFactory {
  constructor(
    @Logger()
    readonly logger: ILogger,
  ) {}

  create(database: IDatabase): Sequelize {
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

  protected createSQLiteConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'sqlite',
      storage: connection.dsn.substr(7), // cut the "sqlite:" 7 char
      logging: process.env.NODE_ENV !== 'test',
      logQueryParameters: true,
    });
  }

  protected createPostgresConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'postgres',
      logging: false,
    });
  }

  protected createMySQLConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'mysql',
      //logging: false,
    });
  }

  protected createMariaDBConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'mariadb',
      //logging: false,
    });
  }
}
