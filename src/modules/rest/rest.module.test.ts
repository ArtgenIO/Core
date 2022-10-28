import { IKernel, Kernel } from '@hisorange/kernel';
import { assert } from 'console';
import { IdentityModule } from '../identity/identity.module';
import { RestGateway } from './rest.gateway';
import { RestModule } from './rest.module';
import { OpenApiService } from './service/openapi.service';

describe(RestModule.name, () => {
  let kernel: IKernel;

  beforeAll(() => {
    kernel = new Kernel();

    assert(kernel.register([RestModule, IdentityModule]));
  });

  test('should register the gateway', async () => {
    expect(await kernel.get(RestGateway)).toBeTruthy();
  });

  test('should register the OpenAPI service', async () => {
    expect(await kernel.get(OpenApiService)).toBeTruthy();
  });
});
