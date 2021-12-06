import { IKernel, Kernel } from '../../app/kernel';
import { ExtensionModule } from '../blueprint/extension.module';
import { EventModule } from '../event';
import { IdentityModule } from '../identity/identity.module';
import { RestModule } from '../rest/rest.module';
import { SchemaModule } from '../schema/collection.module';
import { DatabaseModule } from './database.module';
import { Connection } from './library/connection';
import { ConnectionService } from './service/connection.service';

describe(DatabaseModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();
    kernel.bootstrap([
      DatabaseModule,
      SchemaModule,
      EventModule,
      ExtensionModule,
      IdentityModule,
      RestModule,
    ]);
  });

  test('should create the system connection', async () => {
    // Kernel can start
    const result = await kernel.start();
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

  test('should destroy the system connection', async () => {
    const result = await kernel.stop();

    expect(result).toBe(true);
  });
});
