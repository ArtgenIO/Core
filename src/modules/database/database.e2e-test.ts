import { Model } from 'objection';
import { simpleSchema } from '../../../tests/schemas/simple.schema';
import { IKernel, Kernel } from '../../app/kernel';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { SchemaModule } from '../schema/collection.module';
import { DatabaseModule } from './database.module';
import { ConnectionService } from './service/connection.service';

describe('Database E2E', () => {
  let kernel: IKernel;

  beforeEach(async () => {
    kernel = new Kernel();
    kernel.bootstrap([DatabaseModule, SchemaModule, BlueprintModule]);

    await kernel.start();
  });

  test('should synchornize a system schema', async () => {
    const connSvc = await kernel.get(ConnectionService);
    const conn = await connSvc.findOne('system').associate([simpleSchema]);
    const model = conn.getModel('simple');

    expect(model).toBeInstanceOf(Model);
  });
});
