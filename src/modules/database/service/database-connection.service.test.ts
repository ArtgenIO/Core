import { UnsupportedDialect } from '..';
import { IKernel } from '../../../app/kernel/interface/kernel.interface';
import { Kernel } from '../../../app/kernel/kernel';
import { DatabaseModule } from '../database.module';
import { DatabaseConnection } from '../library/database.connection';
import { DatabaseConnectionConcrete } from '../provider/connection-concrete.provider';
import { DatabaseConnectionService } from './database-connection.service';

describe(DatabaseConnectionService.name, () => {
  let kernel: IKernel;

  beforeEach(() => {
    kernel = new Kernel();
    kernel.register([DatabaseModule]);
  });

  test('should register the connection service', async () => {
    expect(await kernel.get(DatabaseConnectionService)).toBeInstanceOf(
      DatabaseConnectionService,
    );
  });

  describe('Create', () => {
    test.each([
      'sqlite::memory:',
      'mysql://localhost:1234',
      'mariadb://localhost:1234',
      'postgresql://localhost:1234',
      'postgres://localhost:1234',
    ])('should create the connection with the [%s] dsn', async dsn => {
      const associateMock = jest.fn(function () {
        return this;
      });
      class MockConnection extends DatabaseConnection {}

      DatabaseConnectionConcrete.prototype.value = () => MockConnection;
      MockConnection.prototype.associate = associateMock;

      const service = await kernel.get(DatabaseConnectionService);
      const connection = await service.create(
        {
          title: 'Test Database',
          ref: 'test',
          dsn,
        },
        [],
      );

      expect(connection).toBeInstanceOf(MockConnection);
      expect(associateMock).toHaveBeenCalled();
      expect(service.findOne('test').database.ref).toBe('test');
      expect(service.findOne('test').database.title).toBe('Test Database');
    });
  });

  describe('Dialect parser', () => {
    test.each([
      ['mysql://localhost:555', 'mysql'],
      ['mariadb://localhost:5555', 'mariadb'],
      ['postgres://localhost:555', 'postgres'],
      ['postgresql://localhost:555', 'postgres'],
      ['sqlite::memory:', 'sqlite'],
      ['sqlite:./test.db', 'sqlite'],
    ])('should match DSN [%s] as [%s] dialect', async (dns, dialect) => {
      const service = await kernel.get(DatabaseConnectionService);

      expect(service.getDialectFromDSN(dns)).toBe(dialect);
    });

    test('should throw on unsupported dialect', async () => {
      const service = await kernel.get(DatabaseConnectionService);

      expect(() => service.getDialectFromDSN('ftp://localhost:555')).toThrow(
        UnsupportedDialect,
      );
    });

    test('should throw on invalid DSN', async () => {
      const service = await kernel.get(DatabaseConnectionService);

      expect(() => service.getDialectFromDSN('NOTADSN')).toThrow('Invalid URL');
    });
  });
});
