import { IKernel } from '../../../app/kernel/interface/kernel.interface';
import { Kernel } from '../../../app/kernel/kernel';
import { EventModule } from '../../event/event.module';
import { SchemaModule } from '../../schema/collection.module';
import { DatabaseModule } from '../database.module';
import { Connection } from '../library/connection';
import { ConnectionConcrete } from '../provider/connection-concrete.provider';
import { ConnectionService } from './connection.service';

describe(ConnectionService.name, () => {
  let kernel: IKernel;

  beforeEach(() => {
    kernel = new Kernel();
    kernel.bootstrap([DatabaseModule, SchemaModule, EventModule]);
  });

  test('should register the connection service', async () => {
    expect(await kernel.get(ConnectionService)).toBeInstanceOf(
      ConnectionService,
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
      class MockConnection extends Connection {}

      ConnectionConcrete.prototype.value = () => MockConnection;
      MockConnection.prototype.associate = associateMock;

      const service = await kernel.get(ConnectionService);
      const connection = await service.create(
        {
          name: 'test',
          dsn,
        },
        [],
      );

      expect(connection).toBeInstanceOf(MockConnection);
      expect(associateMock).toHaveBeenCalled();
      expect(service.findOne('test').getName()).toBe('test');
    });
  });
});
