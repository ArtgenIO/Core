import { IKernel, Kernel } from '../../app/kernel';
import { CollectionModule } from '../collection/collection.module';
import { DatabaseModule } from './database.module';

describe(DatabaseModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();
    kernel.bootstrap([DatabaseModule, CollectionModule]);
  });

  test('should create the system connection', async () => {
    expect(() => kernel.start()).toBe(true);
  });
});
