import { EventEmitter2 } from 'eventemitter2';
import { createLogger } from 'winston';
import { IKernel, Kernel } from '../../../app/kernel';
import { BlueprintModule } from '../../blueprint/blueprint.module';
import { EventModule } from '../../event';
import { SchemaModule } from '../../schema/schema.module';
import { DatabaseModule } from '../database.module';
import { Connection } from './connection';

describe('DatabaseLink', () => {
  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
    app.bootstrap([DatabaseModule, SchemaModule, EventModule, BlueprintModule]);
  });

  const createLink = (connection = {}) => {
    return new Connection(
      createLogger(),
      new EventEmitter2(),
      connection as any,
      {
        name: 'test',
        dsn: 'sqlite::memory:',
      },
    );
  };

  test('should construct without side effects', async () => {
    expect(() => createLink()).not.toThrow();
  });

  test('should read the database name as link name', async () => {
    const link = createLink();

    expect(link.getName()).toBe('test');
  });

  test('Propagate the close call to the connection', async () => {
    const con = {
      close: jest.fn(),
    };
    const link = createLink(con);
    await link.close();

    expect(con.close).toHaveBeenCalled();
  });

  describe('Schema Managemenent', () => {
    test('should read the empty schema array', () => {
      expect(createLink().getSchemas()).toStrictEqual([]);
    });
  });
});
