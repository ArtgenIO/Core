import { createLogger } from 'winston';
import { SchemaModule } from '../../../content/schema/schema.module';
import { Application } from '../../app/application';
import { IApplication } from '../../app/application.interface';
import { EventModule } from '../../event/event.module';
import { DatabaseModule } from '../database.module';
import { IConnection } from '../interface/connection.interface';
import { ConnectionService } from './connection.service';

const ServiceKey = 'classes.ConnectionService';
const ManagerKey = 'providers.ConnectionManagerProvider';

describe('ConnectionService', () => {
  let app: IApplication;

  beforeEach(() => {
    Application.prototype['createLogger'] = createLogger;
    app = new Application();
    app.bootstrap([DatabaseModule, SchemaModule, EventModule]);
  });

  test('should be able to resolve the connection service', async () => {
    expect(await app.context.get(ServiceKey)).toBeInstanceOf(ConnectionService);
  });

  describe('Creating Connections', () => {
    test('should create an sqlite connection', async () => {
      const url = ':memory:';

      const linkMock = jest.fn();
      const managerMock = {
        has: () => false,
        create: () => ({
          connect: linkMock,
        }),
      };

      app.context.bind(ManagerKey).to(managerMock);

      const connection: Omit<IConnection, 'id'> = {
        name: 'test',
        type: 'sqlite',
        url: url,
      };
      const service = await app.context.get<ConnectionService>(ServiceKey);
      const link = await service.connect(connection, []);

      expect(link).toStrictEqual(managerMock.create());
      expect(linkMock).toHaveBeenCalled();
    });

    test('should create a mysql connection', async () => {
      const url = 'mysql://localhost:1234';

      const linkMock = jest.fn();
      const managerMock = {
        has: () => false,
        create: () => ({
          connect: linkMock,
        }),
      };

      app.context.bind(ManagerKey).to(managerMock);

      const connection: Omit<IConnection, 'id'> = {
        name: 'test',
        type: 'mysql',
        url: url,
      };
      const service = await app.context.get<ConnectionService>(ServiceKey);
      const link = await service.connect(connection, []);

      expect(link).toStrictEqual(managerMock.create());
      expect(linkMock).toHaveBeenCalled();
    });

    test('should create a postgresql connection', async () => {
      const url = 'postgresql://localhost:1234';

      const linkMock = jest.fn();
      const managerMock = {
        has: () => false,
        create: () => ({
          connect: linkMock,
        }),
      };

      app.context.bind(ManagerKey).to(managerMock);

      const connection: Omit<IConnection, 'id'> = {
        name: 'test',
        type: 'postgres',
        url: url,
      };
      const service = await app.context.get<ConnectionService>(ServiceKey);
      const link = await service.connect(connection, []);

      expect(link).toStrictEqual(managerMock.create());
      expect(linkMock).toHaveBeenCalled();
    });
  });

  describe.skip('Create', () => {
    test('should store the connection in the system database', async () => {
      const findOneMock = jest.fn(() => null);
      const saveMock = jest.fn();
      const repositoryMock = {
        findOne: findOneMock,
        save: saveMock,
      };

      app.context.bind(ManagerKey).to({
        has: () => false,
        get: (name: string) => ({
          getRepository: forEntity => repositoryMock,
        }),
      });

      const connection: Omit<IConnection, 'id'> = {
        name: 'test',
        type: 'postgres',
        url: 'postgres://localhost:1534/test',
      };
      const service = await app.context.get<ConnectionService>(ServiceKey);
      const record = await service.create(connection);

      expect(record).toHaveProperty('name');
      expect(record).toHaveProperty('url');
      expect(record).toHaveProperty('type');
      expect(findOneMock).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
    });

    // Need to test the create's upsert behavior but for that we need proper schema management, currently the ID is a mess with mongo and UUID
    test.skip('should update existing connection', () => {});
  });
});
