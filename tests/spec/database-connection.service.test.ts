import { IKernel, Kernel } from '@hisorange/kernel';
import { jest } from '@jest/globals';
import { APIModule } from '../../src/api/api.module';
import { DatabaseConnection } from '../../src/api/database/connection';
import { UnsupportedDialect } from '../../src/api/exceptions/unsupported-dialect.exception';
import { DatabaseConnectionConcrete } from '../../src/api/providers/database/connection-concrete.provider';
import { DatabaseConnectionService } from '../../src/api/services/database-connection.service';

describe(DatabaseConnectionService.name, () => {
  let kernel: IKernel;

  beforeEach(() => {
    kernel = new Kernel();
    kernel.register([APIModule]);
  });

  test('should register the connection service', async () => {
    expect(await kernel.get(DatabaseConnectionService)).toBeInstanceOf(
      DatabaseConnectionService,
    );
  });

  describe('Create', () => {
    test.each([
      'sqlite::memory:',
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
      const connection = await service.connect(
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
