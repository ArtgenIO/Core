import { assert } from 'console';
import { IKernel, Kernel } from '../../app/kernel';
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
