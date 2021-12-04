import { IKernel } from '../../../app/kernel/interface/kernel.interface';
import { Kernel } from '../../../app/kernel/kernel';
import { EventModule } from '../../event/event.module';
import { SchemaModule } from '../../schema/schema.module';
import { DatabaseModule } from '../database.module';
import { IDatabase } from '../interface/database.interface';
import { Connection } from '../library/connection';
import { ConnectionService } from './connection.service';

describe(ConnectionService.name, () => {
  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
    app.bootstrap([DatabaseModule, SchemaModule, EventModule]);
  });

  test('should be able to resolve the link service', async () => {
    expect(await app.context.get(ConnectionService.name)).toBeInstanceOf(
      ConnectionService,
    );
  });

  describe('Creating Links', () => {
    test('should create an sqlite link', async () => {
      const dsn = 'sqlite::memory:';

      const validateMock = jest.fn();
      const connectionFactoryMock = {
        create: () => ({
          validate: validateMock,
        }),
      };

      const db: IDatabase = {
        name: 'test',
        dsn,
      };
      const service = await app.context.get<ConnectionService>(
        ConnectionService.name,
      );
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Connection);
      expect(validateMock).toHaveBeenCalled();
      expect(service.findByName('test')).toStrictEqual(link);
    });

    test('should create a mysql connection', async () => {
      const url = 'mysql://localhost:1234';

      const validateMock = jest.fn();
      const connectionFactoryMock = {
        create: () => ({
          validate: validateMock,
        }),
      };

      const db: IDatabase = {
        name: 'test',
        dsn: url,
      };
      const service = await app.context.get<ConnectionService>(
        ConnectionService.name,
      );
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Connection);
      expect(validateMock).toHaveBeenCalled();
    });

    test('should create a postgresql connection', async () => {
      const url = 'postgresql://localhost:1234';

      const validateMock = jest.fn();
      const connectionFactoryMock = {
        create: () => ({
          validate: validateMock,
        }),
      };

      const db: IDatabase = {
        name: 'test',
        dsn: url,
      };
      const service = await app.context.get<ConnectionService>(
        ConnectionService.name,
      );
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Connection);
      expect(validateMock).toHaveBeenCalled();
    });
  });
});
