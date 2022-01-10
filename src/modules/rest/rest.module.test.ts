import { assert } from 'console';
import { IKernel, Kernel } from '../../app/kernel';
import { RestGateway } from './rest.gateway';
import { RestModule } from './rest.module';
import { RestService } from './rest.service';

describe(RestModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();

    assert(kernel.register([RestModule]));
  });

  test('should register the service', async () => {
    expect(await kernel.get(RestService)).toBeTruthy();
  });

  test('should register the gateway', async () => {
    expect(await kernel.get(RestGateway)).toBeTruthy();
  });
});
