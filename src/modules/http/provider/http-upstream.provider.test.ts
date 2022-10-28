import { IKernel, Kernel } from '@hisorange/kernel';
import {
  BindingScope,
  createBindingFromClass,
  instantiateClass,
  isProviderClass,
} from '@loopback/context';
import { DatabaseModule } from '../../database/database.module';
import { HttpUpstreamProvider } from './http-upstream.provider';

describe(HttpUpstreamProvider.name, () => {
  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
    app.register([DatabaseModule]);
  });

  test('should be defined as a provider', () => {
    const binding = createBindingFromClass(HttpUpstreamProvider);

    expect(binding.key).toBe('providers.HttpUpstreamProvider');
    expect(binding.scope).toBe(BindingScope.SINGLETON);
  });

  test('should be a providier', () => {
    expect(isProviderClass(HttpUpstreamProvider)).toBe(true);
  });

  test('should be able to resolve it', async () => {
    const instance = await instantiateClass(HttpUpstreamProvider, app.context);

    expect(instance).toBeInstanceOf(HttpUpstreamProvider);
  });

  test('should provide a server instance', async () => {
    const instance = await instantiateClass(HttpUpstreamProvider, app.context);
    const server = await instance.value();

    expect(server).toHaveProperty('register');
    expect(server).toHaveProperty('listen');
  });

  test('should have a openapi registered', async () => {
    const instance = await instantiateClass(HttpUpstreamProvider, app.context);
    const server = await instance.value();

    const response = await server.inject({
      method: 'GET',
      url: '/swagger/static/index.html',
    });

    expect(response.statusCode).toBe(200);
  });
});
