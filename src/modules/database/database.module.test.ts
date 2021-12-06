import { assert } from 'console';
import { IKernel, Kernel } from '../../app/kernel';
import { DatabaseModule } from './database.module';
import { Connection } from './library/connection';
import { ConnectionService } from './service/connection.service';

describe(DatabaseModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();

    assert(kernel.register([DatabaseModule]));
  });

  test('should create the system connection', async () => {
    // Kernel can start
    const result = await kernel.boostrap();
    expect(result).toBe(true);

    // Creates one connection
    const connections = await kernel.get(ConnectionService);
    expect(connections.findAll().length).toBe(1);

    // It's named system
    const connection = connections.findOne('system');
    expect(connection).toBeInstanceOf(Connection);
    expect(connection.database.name).toBe('system');

    // Schemas are connected to the system database
    const schemas = connection.getSchemas();
    expect(schemas.length).toBeGreaterThan(1);

    for (const schema of schemas) {
      expect(schema).toHaveProperty('database');
      expect(schema.database).toBe('system');
    }

    // Schemas are synchronized
    const associations = connection.getAssications();

    for (const assoc of associations.values()) {
      expect(assoc.inSync).toBe(true);
    }
  });

  // Still something is off with ts-node stops, can't finish the shutdown sequence
  // but only when running in dev mode
  test('should destroy the system connection', async () => {
    const result = await kernel.stop();
    expect(result).toBe(true);
  });
});
