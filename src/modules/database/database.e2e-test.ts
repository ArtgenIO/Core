import { IKernel, Kernel } from '../../app/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { SchemaModule } from '../schema/schema.module';
import { DatabaseModule } from './database.module';
import { ConnectionService } from './service/connection.service';

describe('Database E2E', () => {
  let kernel: IKernel;

  beforeEach(async () => {
    kernel = new Kernel();
    kernel.register([DatabaseModule, SchemaModule, BlueprintModule]);

    await kernel.boostrap();
  });

  afterEach(async () => {
    await kernel.stop();
  });

  test('should synchornize a simple schema', async () => {
    const connSvc = await kernel.get(ConnectionService);
    const simpleSchema = require('../../../tests/schemas/simple.schema.json');
    const conn = await connSvc.findOne('system').associate([simpleSchema]);

    const model = conn.getModel('simple');
    expect(model).toBeTruthy();

    const schema = conn.getSchema('simple');
    expect(schema.reference).toBe('simple');
  });
});
