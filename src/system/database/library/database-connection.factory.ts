import { Sequelize } from 'sequelize';
import { Exception } from '../../../exception';
import { ILogger, Logger, Service } from '../../container';
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
      case 'mariadb':
        return this.createMySQLConnection(database);
      default:
        throw new Exception(
          `Database type [${database.type}] is not supported`,
        );
    }
  }

  protected createSQLiteConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'sqlite',
      logging: true,
      logQueryParameters: true,
    });
  }

  protected createPostgresConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'postgres',
      logging: true,
    });
  }

  protected createMySQLConnection(connection: IDatabase): Sequelize {
    return new Sequelize(connection.dsn, {
      dialect: 'mysql',
      logging: true,
    });
  }
}
