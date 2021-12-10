import { Knex } from 'knex';
import { IKernel, Kernel } from '../../../app/kernel';
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
      connection as Partial<Knex> as any,
      {
        name: 'test',
        dsn: 'sqlite::memory:',
      },
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
    const con: Pick<Knex, 'destroy'> = {
      destroy: jest.fn(),
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
