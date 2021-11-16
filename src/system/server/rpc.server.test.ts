import {
  BindingScope,
  createBindingFromClass,
  instantiateClass,
  isProviderClass,
} from '@loopback/context';
import { ServiceBroker } from 'moleculer';
import { createLogger } from 'winston';
import { IKernel } from '../kernel/interface/kernel.interface';
import { Kernel } from '../kernel/kernel';
import { RpcServerProvider } from './rpc.server';

describe('RpcServerProvider', () => {
  beforeAll(() => {
    Kernel.prototype['createLogger'] = createLogger;
  });

  let app: IKernel;

  beforeEach(() => {
    app = new Kernel();
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
    process.env.ARTGEN_NODE_ID = 'main';
    const instance = await instantiateClass(RpcServerProvider, app.context);
    const broker = instance.value();

    expect(broker.nodeID).toBe('main');
  });
});
