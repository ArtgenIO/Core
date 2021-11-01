import {
  BindingScope,
  createBindingFromClass,
  instantiateClass,
  isProviderClass,
} from '@loopback/context';
import { ServiceBroker } from 'moleculer';
import { createLogger } from 'winston';
import { Application } from '../app/application';
import { IApplication } from '../app/application.interface';
import { RpcServerProvider } from './rpc.server';

describe('RpcServerProvider', () => {
  beforeAll(() => {
    Application.prototype['createLogger'] = createLogger;
  });

  let app: IApplication;

  beforeEach(() => {
    app = new Application();
  });

  test('should be defined as a provider', () => {
    const binding = createBindingFromClass(RpcServerProvider);

    expect(binding.key).toBe('providers.RpcServerProvider');
    expect(binding.scope).toBe(BindingScope.SINGLETON);
  });

  test('should be a provdier', () => {
    expect(isProviderClass(RpcServerProvider)).toBe(true);
  });

  test('should be able to resolve it', async () => {
    const instance = await instantiateClass(RpcServerProvider, app.context);
    expect(instance).toBeInstanceOf(RpcServerProvider);
  });

  test('should provide a broker instance', async () => {
    const instance = await instantiateClass(RpcServerProvider, app.context);
    const broker = instance.value();

    expect(broker).toBeInstanceOf(ServiceBroker);
    expect(broker).toHaveProperty('start');
    expect(broker).toHaveProperty('stop');
    expect(broker).toHaveProperty('createService');
  });

  test('should use the injected nodeid', async () => {
    const instance = await instantiateClass(RpcServerProvider, app.context);
    const broker = instance.value();

    expect(broker.nodeID).toBe('standalone');
  });
});
