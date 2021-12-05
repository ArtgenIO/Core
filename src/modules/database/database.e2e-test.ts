import { Model } from 'objection';
import { simpleSchema } from '../../../tests/schemas/simple.schema';
import { IKernel, Kernel } from '../../app/kernel';
import { EventModule } from '../event';
import { ExtensionModule } from '../extension/extension.module';
import { SchemaModule } from '../schema/schema.module';
import { DatabaseModule } from './database.module';
import { ConnectionService } from './service/connection.service';

describe('Database E2E', () => {
  let kernel: IKernel;

  beforeEach(async () => {
    kernel = new Kernel();
    kernel.bootstrap([
      DatabaseModule,
      EventModule,
      SchemaModule,
      ExtensionModule,
    ]);

    await kernel.start();
  });

  test('should synchornize a system schema', async () => {
    const connSvc = await kernel.get(ConnectionService);
    const conn = await connSvc.findOne('system').associate([simpleSchema]);
    const model = conn.getModel('simple');

    expect(model).toBeInstanceOf(Model);
  });
});
