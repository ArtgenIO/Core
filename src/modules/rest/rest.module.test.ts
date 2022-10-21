import { IKernel, Kernel } from '@hisorange/kernel';
import { assert } from 'console';
import { RestGateway } from './rest.gateway';
import { RestModule } from './rest.module';
import { OpenApiService } from './service/openapi.service';
import { RestService } from './service/rest.service';

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

  test('should register the OpenAPI service', async () => {
    expect(await kernel.get(OpenApiService)).toBeTruthy();
  });
});
