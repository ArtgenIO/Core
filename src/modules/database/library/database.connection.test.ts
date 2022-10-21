import { IKernel, Kernel } from '@hisorange/kernel';
import { jest } from '@jest/globals';
import { default as KNEX } from 'knex';
import { IDatabase } from '..';
import { DatabaseModule } from '../database.module';
import { DatabaseConnection } from './database.connection';

describe(DatabaseConnection.name, () => {
  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
    app.register([DatabaseModule]);
  });

  const create = (connection = {}) => {
    return app.create(DatabaseConnection, [
      connection as Partial<ReturnType<typeof KNEX>> as any,
      {
        title: 'test',
        ref: 'test',
        dsn: 'sqlite::memory:',
      } as IDatabase,
      'sqlite',
    ]);
  };

  test('should construct without side effects', async () => {
    expect(() => create()).not.toThrow();
  });

  test('should read the database name as link name', async () => {
    const connection = await create();
    expect(connection.database.ref).toBe('test');
  });

  test('Propagate the close call to the connection', async () => {
    const con: Pick<ReturnType<typeof KNEX>, 'destroy'> = {
      destroy: jest.fn() as any,
    };
    const connection = await create(con);
    await connection.close();

    expect(con.destroy).toHaveBeenCalled();
  });

  describe('Schema Managemenent', () => {
    test('should read the empty schema array', async () => {
      const connection = await create();
      expect(connection.getSchemas()).toStrictEqual([]);
    });
  });
});
