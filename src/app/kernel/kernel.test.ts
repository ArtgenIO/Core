import { Context, Provider } from '@loopback/context';
import { IModule, Inject, Module, Service } from '../container';
import { IKernel } from './interface/kernel.interface';
import { Kernel } from './kernel';

describe(Kernel.name, () => {
  describe('Initialization', () => {
    test('should construct without error', () => {
      expect(() => new Kernel()).not.toThrow();
    });

    test('should create a valid logger', () => {
      const kernel = new Kernel();

      expect(kernel).toHaveProperty('logger');
      expect(kernel.logger).toHaveProperty('debug');
      expect(kernel.logger).toHaveProperty('info');
      expect(kernel.logger).toHaveProperty('warn');
      expect(kernel.logger).toHaveProperty('error');
    });

    test('should register the main context', () => {
      const kernel = new Kernel();

      expect(kernel).toHaveProperty('context');
      expect(kernel.context).toBeInstanceOf(Context);
    });

    test('should register the kernel in the context', () => {
      expect(new Kernel().context.contains('Kernel')).toBe(true);
    });
  });

  describe('Register', () => {
    test('should proceed even if no module is registered', () => {
      expect(new Kernel().register([])).toBe(true);
    });

    test('should fail when an invalid module is registered', () => {
      const kernel = new Kernel();
      const nonModules: any[] = [{}, '', 2, true];

      for (const subject of nonModules) {
        expect(kernel.register([subject])).toBe(false);
      }
    });

    test('should fail when a non module class included', () => {
      class NotAModule {}

      expect(new Kernel().register([NotAModule])).toBe(false);
    });

    test('should register a blank module', () => {
      const kernel = new Kernel();

      @Module()
      class BlankModule {}

      expect(kernel.register([BlankModule])).toBe(true);
      expect(kernel.context.contains('module.BlankModule')).toBe(true);
    });

    test('should register module providers', () => {
      const kernel = new Kernel();

      @Service()
      class ServiceA {}
      @Service()
      class ServiceB {}

      @Module({
        providers: [ServiceA, ServiceB],
      })
      class TestModule {}

      expect(kernel.register([TestModule])).toBe(true);
      expect(kernel.context.contains('classes.ServiceA')).toBe(true);
      expect(kernel.context.contains('classes.ServiceB')).toBe(true);
    });

    test('should register submodule providers', () => {
      const kernel = new Kernel();

      @Service()
      class ServiceA {}
      @Service()
      class SubServiceA {}
      @Service()
      class SubSubServiceA {}

      @Module({
        providers: [SubSubServiceA],
      })
      class SubSubModule {}

      @Module({
        imports: [SubSubModule],
        providers: [SubServiceA],
      })
      class SubModule {}

      @Module({
        imports: [SubModule],
        providers: [ServiceA],
      })
      class TopModule {}

      expect(kernel.register([TopModule])).toBe(true);

      expect(kernel.context.contains('classes.ServiceA')).toBe(true);
      expect(kernel.context.contains('classes.SubServiceA')).toBe(true);
      expect(kernel.context.contains('classes.SubSubServiceA')).toBe(true);

      expect(kernel.context.contains('module.TopModule')).toBe(true);
      expect(kernel.context.contains('module.SubModule')).toBe(true);
      expect(kernel.context.contains('module.SubSubModule')).toBe(true);
    });

    test('should resolve services by their class', () => {
      const kernel = new Kernel();

      @Service()
      class ServiceA {}

      @Service()
      class ServiceB {
        constructor(
          @Inject(ServiceA)
          readonly serviceA: ServiceA,
        ) {}
      }

      @Module({
        providers: [ServiceA, ServiceB],
      })
      class TestModule {}

      expect(kernel.register([TestModule])).toBe(true);

      const serviceA = kernel.context.getSync<ServiceA>(ServiceA.name);
      const serviceB = kernel.context.getSync<ServiceB>(ServiceB.name);

      expect(serviceA).toBeInstanceOf(ServiceA);
      expect(serviceB).toBeInstanceOf(ServiceB);

      expect(serviceB).toHaveProperty('serviceA');
      expect(serviceB.serviceA).toBeInstanceOf(ServiceA);
    });

    test('should resolve provider values by their product', () => {
      const kernel = new Kernel();

      class Product {}

      @Service(Product)
      class ProviderA implements Provider<Product> {
        value(): Product {
          return new Product();
        }
      }

      @Module({
        providers: [ProviderA],
      })
      class TestModule {}

      expect(kernel.register([TestModule])).toBe(true);
      const product = kernel.context.getSync<Product>(Product.name);
      expect(product).toBeInstanceOf(Product);
    });
  });

  describe('Bootstrap', () => {
    test('should bootstrap without modules', async () => {
      const kernel = new Kernel();
      kernel.register([]);

      expect(await kernel.boostrap()).toBe(true);
    });

    test('should invoke the onStart hook', async () => {
      const kernel = new Kernel();
      const startMock = jest.fn();

      @Module({})
      class StartMeModule implements IModule {
        async onBoot(app: IKernel) {
          startMock(app);
        }
      }

      kernel.register([StartMeModule]);

      expect(await kernel.boostrap()).toBe(true);
      expect(startMock).toHaveBeenCalled();
      expect(startMock).toHaveBeenCalledTimes(1);
      expect(startMock).toHaveBeenCalledWith(kernel);
    });

    test('should fail on erroring start', async () => {
      const kernel = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onBoot(app: IKernel) {
          throw new Error('Stop it');
        }
      }

      kernel.register([BadModule]);
      expect(await kernel.boostrap()).toBe(false);
    });

    test('should call the onStop when the start failing', async () => {
      const kernel = new Kernel();
      const stopMock = jest.fn();

      @Module({})
      class BadModule implements IModule {
        async onBoot(app: IKernel) {
          throw new Error('Stop it');
        }

        async onStop(app: IKernel) {
          stopMock(app);
        }
      }

      kernel.register([BadModule]);

      expect(await kernel.boostrap()).toBe(false);
      expect(stopMock).toHaveBeenCalled();
      expect(stopMock).toHaveBeenCalledTimes(1);
      expect(stopMock).toHaveBeenCalledWith(kernel);
    });

    test('should start modules in dependency order', async () => {
      const kernel = new Kernel();
      const order: string[] = [];

      @Module()
      class FirstModule implements IModule {
        async onBoot() {
          order.push('first');
        }
      }

      @Module({
        dependsOn: [FirstModule],
      })
      class SecondModule implements IModule {
        async onBoot() {
          order.push('second');
        }
      }

      @Module({
        dependsOn: [SecondModule],
      })
      class ThirdModule implements IModule {
        async onBoot() {
          order.push('third');
        }
      }

      @Module({})
      class ForthModule implements IModule {
        async onBoot() {
          order.push('forth');
        }
      }

      kernel.register([ForthModule, ThirdModule, SecondModule, FirstModule]);

      expect(await kernel.boostrap()).toBe(true);
      expect(order).toStrictEqual(['forth', 'first', 'second', 'third']);
    });

    // Not yet implemented, because I don't have a proper usecase for it.
    // Submodule first, or main module first? I get it, propagating down, but I had a lot of trouble with this in the past
    // when you wana load functionality with a submodule, but the dependencies are too tight and causes circular locks.
    test.skip('should load leaf nodes first if they have no dependency', () => {});
  });

  describe('Stopping', () => {
    test('should complete the shutdown', async () => {
      const kernel = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IKernel) {}
      }

      kernel.register([BadModule]);
      expect(await kernel.stop()).toBe(true);
    });

    test('should fail the shutdown', async () => {
      const kernel = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IKernel) {
          throw new Error('Stop it');
        }
      }

      kernel.register([BadModule]);
      expect(await kernel.stop()).toBe(false);
    });

    test('should stop modules in reverse dependency order', async () => {
      const kernel = new Kernel();
      const order: string[] = [];

      @Module()
      class FirstModule implements IModule {
        async onStop() {
          order.push('first');
        }
      }

      @Module({
        dependsOn: [FirstModule],
      })
      class SecondModule implements IModule {
        async onStop() {
          order.push('second');
        }
      }

      @Module({
        dependsOn: [SecondModule],
      })
      class ThirdModule implements IModule {
        async onStop() {
          order.push('third');
        }
      }

      @Module({})
      class ForthModule implements IModule {
        async onStop() {
          order.push('forth');
        }
      }

      kernel.register([ForthModule, ThirdModule, SecondModule, FirstModule]);

      expect(await kernel.boostrap()).toBe(true);
      expect(await kernel.stop()).toBe(true);
      expect(order).toStrictEqual(
        ['forth', 'first', 'second', 'third'].reverse(),
      );
    });
  });

  describe('Get', () => {
    test('should resolve injections', async () => {
      const kernel = new Kernel();

      @Service()
      class ServiceA {}

      @Module({
        providers: [ServiceA],
      })
      class ModuleA {}

      kernel.register([ModuleA]);

      expect(await kernel.get(ServiceA)).toBeInstanceOf(ServiceA);
    });
  });

  describe('Replace', () => {
    test('should replace the injection', async () => {
      const kernel = new Kernel();
      const key = 'classes.ServiceA';

      @Service()
      class ServiceA {}

      @Service()
      class MockServiceA {}

      @Module({
        providers: [ServiceA],
      })
      class ModuleA {}

      kernel.register([ModuleA]);
      expect(kernel.context.contains(key));

      const original = await kernel.get(ServiceA);
      // Replace the already resolved value.
      kernel.replace(ServiceA, MockServiceA);
      // Reresolve the original key
      const mock = await kernel.get(ServiceA);

      expect(original).toBeInstanceOf(ServiceA);
      expect(mock).toBeInstanceOf(MockServiceA);
    });
  });

  describe('Create', () => {
    test('should create partially injected class instance', async () => {
      const kernel = new Kernel();

      @Service()
      class ServiceB {}

      @Service()
      class ServiceA {
        constructor(
          @Inject(ServiceB)
          readonly inst: ServiceB,
          readonly p1: number,
          readonly p2: number,
        ) {}
      }

      @Module({
        providers: [ServiceA, ServiceB],
      })
      class ModuleA {}

      kernel.register([ModuleA]);

      const svc = await kernel.create(ServiceA, [5, 21]);

      expect(svc).toBeInstanceOf(ServiceA);
      expect(svc.inst).toBeInstanceOf(ServiceB);
      expect(svc.p1).toBe(5);
      expect(svc.p2).toBe(21);
    });
  });
});
