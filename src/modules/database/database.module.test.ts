import { IKernel, Kernel } from '../../app/kernel';
import { SchemaModule } from '../schema/schema.module';
import { DatabaseModule } from './database.module';

describe(DatabaseModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();
    kernel.bootstrap([DatabaseModule, SchemaModule]);
  });

  test('should create the system connection', async () => {
    expect(() => kernel.start()).toBe(true);
  });
});
