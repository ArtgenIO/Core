import { createLogger } from 'winston';
import { Application } from '../../app/application';
import { IApplication } from '../../app/application.interface';
import { DatabaseEntity } from '../collection/database.collection';
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
    app.bootstrap([DatabaseModule]);
  });

  test('should be able to resolve the connection service', async () => {
    expect(await app.context.get(ServiceKey)).toBeInstanceOf(ConnectionService);
  });

  describe('Database Type Parser', () => {
    test('should be able to find mongodb type', async () => {
      const service = await app.context.get<ConnectionService>(ServiceKey);

      expect(service.getDatabaseTypeFromUrl('mongodb://localhost:5432')).toBe(
        'mongodb',
      );
      expect(
        service.getDatabaseTypeFromUrl('mongodb+srv://localhost:5432'),
      ).toBe('mongodb');
    });

    test('should be able to find mysql type', async () => {
      const service = await app.context.get<ConnectionService>(ServiceKey);

      expect(service.getDatabaseTypeFromUrl('mysql://localhost:555')).toBe(
        'mysql',
      );
      expect(service.getDatabaseTypeFromUrl('mariadb://localhost:5555')).toBe(
        'mysql',
      );
    });

    test('should be able to find postgres type', async () => {
      const service = await app.context.get<ConnectionService>(ServiceKey);

      expect(service.getDatabaseTypeFromUrl('postgres://localhost:555')).toBe(
        'postgres',
      );
      expect(
        service.getDatabaseTypeFromUrl('postgresql://localhost:5555'),
      ).toBe('postgres');
    });

    test('should fail on unknow type', async () => {
      const service = await app.context.get<ConnectionService>(ServiceKey);

      expect(service.getDatabaseTypeFromUrl('wash://localhost:555')).toBe(
        false,
      );

      expect(service.getDatabaseTypeFromUrl('NOTAURL')).toBe(false);
    });
  });

  describe('Creating Connections', () => {
    test('should create a mongo connection', async () => {
      const url = 'mongodb://localhost:1234';

      const linkMock = jest.fn();
      const managerMock = {
        create: () => ({
          connect: linkMock,
        }),
      };

      app.context.bind(ManagerKey).to(managerMock);

      const connection: Omit<IConnection, 'id'> = {
        name: 'test',
        type: 'mongodb',
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

  describe('Create', () => {
    test('should store the connection in the system database', async () => {
      const findOneMock = jest.fn(() => null);
      const saveMock = jest.fn();
      const repositoryMock = {
        findOne: findOneMock,
        save: saveMock,
      };

      app.context.bind(ManagerKey).to({
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

      expect(record).toBeInstanceOf(DatabaseEntity);
      expect(findOneMock).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
    });

    // Need to test the create's upsert behavior but for that we need proper collection management, currently the ID is a mess with mongo and UUID
    test.skip('should update existing connection', () => {});
  });
});
