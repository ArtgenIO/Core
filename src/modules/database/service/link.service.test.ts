import { IKernel } from '../../../app/kernel/interface/kernel.interface';
import { Kernel } from '../../../app/kernel/kernel';
import { EventModule } from '../../event/event.module';
import { SchemaModule } from '../../schema/schema.module';
import { DatabaseModule } from '../database.module';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionFactory } from '../library/database-connection.factory';
import { Link } from '../library/link';
import { LinkService } from './link.service';

describe(LinkService.name, () => {
  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
    app.bootstrap([DatabaseModule, SchemaModule, EventModule]);
  });

  test('should be able to resolve the link service', async () => {
    expect(await app.context.get(LinkService.name)).toBeInstanceOf(LinkService);
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

      app.context
        .bind(DatabaseConnectionFactory.name)
        .to(connectionFactoryMock);

      const db: IDatabase = {
        name: 'test',
        type: 'sqlite',
        dsn,
      };
      const service = await app.context.get<LinkService>(LinkService.name);
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Link);
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

      app.context
        .bind(DatabaseConnectionFactory.name)
        .to(connectionFactoryMock);

      const db: IDatabase = {
        name: 'test',
        type: 'mysql',
        dsn: url,
      };
      const service = await app.context.get<LinkService>(LinkService.name);
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Link);
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

      app.context
        .bind(DatabaseConnectionFactory.name)
        .to(connectionFactoryMock);

      const db: IDatabase = {
        name: 'test',
        type: 'postgres',
        dsn: url,
      };
      const service = await app.context.get<LinkService>(LinkService.name);
      const link = await service.create(db, []);

      expect(link).toBeInstanceOf(Link);
      expect(validateMock).toHaveBeenCalled();
    });
  });
});
