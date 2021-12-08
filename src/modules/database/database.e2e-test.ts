import { IKernel, Kernel } from '../../app/kernel';
import { DatabaseModule } from './database.module';
import { DatabaseConnectionService } from './service/database-connection.service';

describe('Database E2E', () => {
  let kernel: IKernel;

  beforeAll(async () => {
    kernel = new Kernel();
    kernel.register([DatabaseModule]);

    await kernel.boostrap();
  });

  afterAll(async () => {
    await kernel.stop();
  });

  test.each([
    'simple',
    'enums',
    'commons',
    'texts',
    'textsxl',
    'textsxl2',
    'textsxl3',
    'ints',
  ])('should synchornize the [%s] test schema', async (ref: string) => {
    // Prepare deps
    const connections = await kernel.get(DatabaseConnectionService);
    const connection = connections.findOne('system');
    // Load the test schema
    const subject = require(`../../../tests/schemas/${ref}.schema.json`);

    // Remove artifacts from previous test if any
    await connection.synchornizer.deleteTable(ref);

    // Run the synchronization
    await connection.associate([subject]);

    // Reset the sync, so we can fail if there is a diff in revert
    connection.associations.get(ref).inSync = false;

    // Resync
    await connection.synchornizer.sync();

    expect(connection.getModel(ref)).toBeTruthy();
    expect(connection.getSchema(ref).reference).toBe(ref);

    // Clean up
    await connection.synchornizer.deleteTable(ref).catch(e => {});
  });
});
