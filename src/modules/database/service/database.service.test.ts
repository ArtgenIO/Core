import { IKernel, Kernel } from '@hisorange/kernel';
import { DatabaseModule } from '../database.module';
import { DatabaseService } from './database.service';

describe(DatabaseService.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();
    kernel.register([DatabaseModule]);
  });

  test('should create the main database object', async () => {
    const service = await kernel.get(DatabaseService);
    const main = service['getMainDatabase']();
    const dsn = process.env.ARTGEN_DATABASE_DSN ?? 'sqlite::memory:';

    expect(main).toHaveProperty('ref');
    expect(main).toHaveProperty('dsn');
    expect(main.ref).toBe('main');
    expect(main.dsn).toBe(dsn);
  });
});
