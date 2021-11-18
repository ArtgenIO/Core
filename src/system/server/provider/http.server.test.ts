import {
  BindingScope,
  createBindingFromClass,
  instantiateClass,
  isProviderClass,
} from '@loopback/context';
import { createLogger } from 'winston';
import { IKernel } from '../../kernel/interface/kernel.interface';
import { Kernel } from '../../kernel/kernel';
import { HttpServerProvider } from './http.server';

describe('HTTPServerProvider', () => {
  beforeAll(() => {
    Kernel.prototype['createLogger'] = createLogger;
  });

  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
  });

  test('should be defined as a provider', () => {
    const binding = createBindingFromClass(HttpServerProvider);

    expect(binding.key).toBe('providers.HttpServerProvider');
    expect(binding.scope).toBe(BindingScope.SINGLETON);
  });

  test('should be a providier', () => {
    expect(isProviderClass(HttpServerProvider)).toBe(true);
  });

  test('should be able to resolve it', async () => {
    const instance = await instantiateClass(HttpServerProvider, app.context);

    expect(instance).toBeInstanceOf(HttpServerProvider);
  });

  test('should provide a server instance', async () => {
    const instance = await instantiateClass(HttpServerProvider, app.context);
    const server = await instance.value();

    expect(server).toHaveProperty('register');
    expect(server).toHaveProperty('listen');
  });

  test('should have a openapi registered', async () => {
    const instance = await instantiateClass(HttpServerProvider, app.context);
    const server = await instance.value();

    const response = await server.inject({
      method: 'GET',
      url: '/api/docs/static/index.html',
    });

    expect(response.statusCode).toBe(200);
  });
});
