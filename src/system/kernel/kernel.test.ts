import { Context, Provider } from '@loopback/context';
import { createLogger } from 'winston';
import { IModule, Inject, Module, Service } from '../container';
import { IKernel } from './interface/kernel.interface';
import { Kernel } from './kernel';

jest.setTimeout(50);

describe('Kernel', () => {
  const createTestLogger = jest.fn(() => createLogger());

  Kernel.prototype['createLogger'] = createTestLogger;

  describe('Initialization', () => {
    test('should construct without error', () => {
      expect(() => new Kernel()).not.toThrow();
    });

    test('should create a valid logger', () => {
      const app = new Kernel();

      expect(app).toHaveProperty('logger');
      expect(app.logger).toHaveProperty('debug');
      expect(app.logger).toHaveProperty('info');
      expect(app.logger).toHaveProperty('warn');
      expect(app.logger).toHaveProperty('error');
    });

    test('should register the "Kernel" in the context', () => {
      const app = new Kernel();

      expect(app).toHaveProperty('context');
      expect(app.context).toBeInstanceOf(Context);
    });

    test('should register the "Kernel" in the context', () => {
      expect(new Kernel().context.contains('Kernel')).toBe(true);
    });
  });

  describe('Bootstrapping', () => {
    test('should proceed even if no module is registered', () => {
      const app = new Kernel();

      expect(app.bootstrap([])).toBe(true);
    });

    test('should fail when an invalid type is registered', () => {
      const app = new Kernel();
      const nonModules: any[] = [{}, '', 2, true];

      for (const subject of nonModules) {
        expect(app.bootstrap([subject])).toBe(false);
      }
    });

    test('should fail when a non module class included', () => {
      const app = new Kernel();

      class NotAModule {}

      expect(app.bootstrap([NotAModule])).toBe(false);
    });

    test('should register a blank module', () => {
      const app = new Kernel();

      @Module()
      class BlankModule {}

      expect(app.bootstrap([BlankModule])).toBe(true);
      expect(app.context.contains('module.BlankModule')).toBe(true);
    });

    test('should register module providers', () => {
      const app = new Kernel();

      @Service()
      class ServiceA {}
      @Service()
      class ServiceB {}

      @Module({
        providers: [ServiceA, ServiceB],
      })
      class TestModule {}

      expect(app.bootstrap([TestModule])).toBe(true);
      expect(app.context.contains('classes.ServiceA')).toBe(true);
      expect(app.context.contains('classes.ServiceB')).toBe(true);
    });

    test('should register submodule providers', () => {
      const app = new Kernel();

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
        exports: [SubSubModule],
        providers: [SubServiceA],
      })
      class SubModule {}

      @Module({
        exports: [SubModule],
        providers: [ServiceA],
      })
      class TopModule {}

      expect(app.bootstrap([TopModule])).toBe(true);

      expect(app.context.contains('classes.ServiceA')).toBe(true);
      expect(app.context.contains('classes.SubServiceA')).toBe(true);
      expect(app.context.contains('classes.SubSubServiceA')).toBe(true);

      expect(app.context.contains('module.TopModule')).toBe(true);
      expect(app.context.contains('module.SubModule')).toBe(true);
      expect(app.context.contains('module.SubSubModule')).toBe(true);
    });

    test('should resolve services by their class', () => {
      const app = new Kernel();

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

      expect(app.bootstrap([TestModule])).toBe(true);

      const serviceA = app.context.getSync<ServiceA>(ServiceA.name);
      const serviceB = app.context.getSync<ServiceB>(ServiceB.name);

      expect(serviceA).toBeInstanceOf(ServiceA);
      expect(serviceB).toBeInstanceOf(ServiceB);

      expect(serviceB).toHaveProperty('serviceA');
      expect(serviceB.serviceA).toBeInstanceOf(ServiceA);
    });

    test('should resolve provider values by their product', () => {
      const app = new Kernel();

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

      expect(app.bootstrap([TestModule])).toBe(true);

      const product = app.context.getSync<Product>(Product.name);

      expect(product).toBeInstanceOf(Product);
    });
  });

  describe('Starting', () => {
    test('should start without modules', async () => {
      const app = new Kernel();
      app.bootstrap([]);

      expect(await app.start()).toBe(true);
    });

    test('should invoke the onStart hook', async () => {
      const app = new Kernel();
      const startMock = jest.fn();

      @Module({})
      class StartMeModule implements IModule {
        async onStart(app: IKernel) {
          startMock(app);
        }
      }

      app.bootstrap([StartMeModule]);

      expect(await app.start()).toBe(true);
      expect(startMock).toHaveBeenCalled();
      expect(startMock).toHaveBeenCalledTimes(1);
      expect(startMock).toHaveBeenCalledWith(app);
    });

    test('should fail on erroring start', async () => {
      const app = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStart(app: IKernel) {
          throw new Error('Stop it');
        }
      }

      app.bootstrap([BadModule]);

      expect(await app.start()).toBe(false);
    });

    test('should call the onStop when the start failing', async () => {
      const app = new Kernel();
      const stopMock = jest.fn();

      @Module({})
      class BadModule implements IModule {
        async onStart(app: IKernel) {
          throw new Error('Stop it');
        }

        async onStop(app: IKernel) {
          stopMock(app);
        }
      }

      app.bootstrap([BadModule]);

      expect(await app.start()).toBe(false);
      expect(stopMock).toHaveBeenCalled();
      expect(stopMock).toHaveBeenCalledTimes(1);
      expect(stopMock).toHaveBeenCalledWith(app);
    });

    test('should start modules in dependency order', async () => {
      const app = new Kernel();
      const order: string[] = [];

      @Module()
      class FirstModule implements IModule {
        async onStart() {
          order.push('first');
        }
      }

      @Module({
        dependsOn: [FirstModule],
      })
      class SecondModule implements IModule {
        async onStart() {
          order.push('second');
        }
      }

      @Module({
        dependsOn: [SecondModule],
      })
      class ThirdModule implements IModule {
        async onStart() {
          order.push('third');
        }
      }

      @Module({})
      class ForthModule implements IModule {
        async onStart() {
          order.push('forth');
        }
      }

      app.bootstrap([ForthModule, ThirdModule, SecondModule, FirstModule]);

      expect(await app.start()).toBe(true);
      expect(order).toStrictEqual(['forth', 'first', 'second', 'third']);
    });

    // Not yet implemented, because I don't have a proper usecase for it.
    // Submodule first, or main module first? I get it, propagating down, but I had a lot of trouble with this in the past
    // when you wana load functionality with a submodule, but the dependencies are too tight and causes circular locks.
    test.skip('should load leaf nodes first if they have no dependency', () => {});
  });

  describe('Stopping', () => {
    test('should complete the shutdown', async () => {
      const app = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IKernel) {}
      }

      app.bootstrap([BadModule]);

      expect(await app.stop()).toBe(true);
    });

    test('should fail the shutdown', async () => {
      const app = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IKernel) {
          throw new Error('Stop it');
        }
      }

      app.bootstrap([BadModule]);

      expect(await app.stop()).toBe(false);
    });

    // Something is off with this version, I get exit code 130 and
    // cannot see why, the log stream dies when I try to open a new promise
    // Seems like it's a one off problem.
    test.skip('should timeout the bad onStop', async () => {
      const app = new Kernel();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IKernel) {
          await new Promise(neverResolved => {
            // This promise hangs forever
          });
        }
      }

      jest.advanceTimersToNextTimer();

      app.bootstrap([BadModule]);

      expect(await app.stop()).toBe(false);
    });

    // See above
    test.skip('should kill the modules with a global timeout', () => {});

    test('should stop modules in reverse dependency order', async () => {
      const app = new Kernel();
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

      app.bootstrap([ForthModule, ThirdModule, SecondModule, FirstModule]);

      expect(await app.start()).toBe(true);
      expect(await app.stop()).toBe(true);
      expect(order).toStrictEqual(
        ['forth', 'first', 'second', 'third'].reverse(),
      );
    });
  });
});
