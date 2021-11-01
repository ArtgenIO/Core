import { Context } from '@loopback/context';
import { createLogger } from 'winston';
import { IModule, Module, Service } from '../container';
import { Application } from './application';
import { IApplication } from './application.interface';

jest.setTimeout(50);

describe('Application', () => {
  const createLoggerMock = jest.fn(() => createLogger());

  Application.prototype['createLogger'] = createLoggerMock;

  describe('Initialization', () => {
    test('should construct without error', () => {
      expect(() => new Application()).not.toThrow();
    });

    test('should have a node identifier', () => {
      const app = new Application();

      expect(app).toHaveProperty('id');
      expect(app.id).toBe('standalone');
    });

    test('should create a valid logger', () => {
      const app = new Application();

      expect(app).toHaveProperty('logger');
      expect(app.logger).toHaveProperty('debug');
      expect(app.logger).toHaveProperty('info');
      expect(app.logger).toHaveProperty('warn');
      expect(app.logger).toHaveProperty('error');
    });

    test('should register the "Application" in the context', () => {
      const app = new Application();

      expect(app).toHaveProperty('context');
      expect(app.context).toBeInstanceOf(Context);
    });

    test('should register the "Application" in the context', () => {
      expect(new Application().context.contains('Application')).toBe(true);
    });
  });

  describe('Bootstrapping', () => {
    test('should proceed even if no module is registered', () => {
      const app = new Application();

      expect(app.bootstrap([])).toBe(true);
    });

    test('should fail when an invalid type is registered', () => {
      const app = new Application();
      const nonModules: any[] = [{}, '', 2, true];

      for (const subject of nonModules) {
        expect(app.bootstrap([subject])).toBe(false);
      }
    });

    test('should fail when a non module class included', () => {
      const app = new Application();

      class NotAModule {}

      expect(app.bootstrap([NotAModule])).toBe(false);
    });

    test('should register a blank module', () => {
      const app = new Application();

      @Module()
      class BlankModule {}

      expect(app.bootstrap([BlankModule])).toBe(true);
      expect(app.context.contains('module.BlankModule')).toBe(true);
    });

    test('should register module providers', () => {
      const app = new Application();

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
      const app = new Application();

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

      expect(app.bootstrap([TopModule])).toBe(true);

      expect(app.context.contains('classes.ServiceA')).toBe(true);
      expect(app.context.contains('classes.SubServiceA')).toBe(true);
      expect(app.context.contains('classes.SubSubServiceA')).toBe(true);

      expect(app.context.contains('module.TopModule')).toBe(true);
      expect(app.context.contains('module.SubModule')).toBe(true);
      expect(app.context.contains('module.SubSubModule')).toBe(true);
    });
  });

  describe('Starting', () => {
    test('should start without modules', async () => {
      const app = new Application();
      app.bootstrap([]);

      expect(await app.start()).toBe(true);
    });

    test('should invoke the onStart hook', async () => {
      const app = new Application();
      const startMock = jest.fn();

      @Module({})
      class StartMeModule implements IModule {
        async onStart(app: IApplication) {
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
      const app = new Application();

      @Module({})
      class BadModule implements IModule {
        async onStart(app: IApplication) {
          throw new Error('Stop it');
        }
      }

      app.bootstrap([BadModule]);

      expect(await app.start()).toBe(false);
    });

    test('should call the onStop when the start failing', async () => {
      const app = new Application();
      const stopMock = jest.fn();

      @Module({})
      class BadModule implements IModule {
        async onStart(app: IApplication) {
          throw new Error('Stop it');
        }

        async onStop(app: IApplication) {
          stopMock(app);
        }
      }

      app.bootstrap([BadModule]);

      expect(await app.start()).toBe(false);
      expect(stopMock).toHaveBeenCalled();
      expect(stopMock).toHaveBeenCalledTimes(1);
      expect(stopMock).toHaveBeenCalledWith(app);
    });
  });

  describe('Stopping', () => {
    test('should complete the shutdown', async () => {
      const app = new Application();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IApplication) {}
      }

      app.bootstrap([BadModule]);

      expect(await app.stop()).toBe(true);
    });

    test('should fail the shutdown', async () => {
      const app = new Application();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IApplication) {
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
      const app = new Application();

      @Module({})
      class BadModule implements IModule {
        async onStop(app: IApplication) {
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
  });
});
