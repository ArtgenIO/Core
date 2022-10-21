import { IKernel, Kernel } from '@hisorange/kernel';
import { assert } from 'console';
import { TrapGateway } from './gateway/trap.gateway';
import { SecurityModule } from './security.module';

describe(SecurityModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();

    assert(kernel.register([SecurityModule]));
  });

  test('should register the gateway', async () => {
    expect(await kernel.get(TrapGateway)).toBeTruthy();
  });
});
