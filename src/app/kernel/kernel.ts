import {
  Binding,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  Reflector,
} from '@loopback/context';
import { DepGraph } from 'dependency-graph';
import { default as timeout } from 'p-timeout';
import {
  IContext,
  ILogger,
  IModule,
  IModuleMeta,
  MODULE_KEY,
} from '../container';
import { Exception } from '../exceptions/exception';
import { createLogger } from '../logger/create-logger';
import { IKernel } from './interface/kernel.interface';
import { getErrorMessage } from './util/extract-error';

/**
 * Kernel is responsible to manage the modules defined by the developer,
 * every dependency and application flow is managed by the start / stop
 * functionality.
 *
 * You can bootstrap the kernel without starting the application to create
 * a test environment where every resource is available without the
 * module onStart hooks.
 */
export class Kernel implements IKernel {
  readonly context: IContext;
  readonly logger: ILogger;

  /**
   * Used to build the module loading graph, stores the startup dependency links
   * this way we can start and stop the modules in ideal order.
   */
  protected moduleGraph: DepGraph<void> = new DepGraph({
    circular: false,
  });

  /**
   * Initialize the kernel.
   */
  constructor() {
    this.logger = createLogger();
    this.logger.debug('Creating the context...');

    this.context = new Context('app');
    this.context.bind('Kernel').to(this);

    this.logger.info('Context is ready!');
  }

  /**
   * Register modules in the dependency container and module load graph.
   */
  protected register(modules: Constructor<IModule>[]) {
    for (const module of modules) {
      // Test for basic module expectations
      if (typeof module !== 'function') {
        throw new Exception(
          `Could not register [${module}], it's not a module!`,
        );
      }

      const name = module.name;
      const key = `module.${name}`;

      if (!this.context.contains(key)) {
        // Register for dependency loading
        if (!this.moduleGraph.hasNode(key)) {
          this.moduleGraph.addNode(key);
        }

        this.logger.debug('Discovered [%s] module', name);

        // Bind the instance for hook executions
        this.context
          .bind(key)
          .toClass(module)
          .inScope(BindingScope.SINGLETON)
          .tag('module');

        // Check for the @Module decorator
        if (Reflector.hasOwnMetadata(MODULE_KEY, module)) {
          const meta: IModuleMeta = Reflector.getOwnMetadata(
            MODULE_KEY,
            module,
          );

          // Module export submodules
          if (meta.exports) {
            // Note: If we need to wait for a parent module then the dependsOn will
            // cause locking, so maybe it would be beneficial to load the leaf modules first
            // then the parent? We will see, but if needed we can simply pass the parent key here
            // and register the module as dependents on the parent. Even tho this could easily create
            // dead locks, if the parent module is a dependency but the dependency waiting for a submodule of the parent.
            this.register(meta.exports);
          }

          // Register dependencies
          if (meta.dependsOn) {
            for (const dependency of meta.dependsOn) {
              const dependencyKey = `module.${dependency.name}`;

              this.logger.debug(
                'Module [%s] is dependent of the [%s] module',
                name,
                dependency.name,
              );

              // Inject the dependency, because the discovery is not executed in
              // dependency order, and causes to break the node tree.
              if (!this.moduleGraph.hasNode(dependencyKey)) {
                this.moduleGraph.addNode(dependencyKey);
              }

              this.moduleGraph.addDependency(key, dependencyKey);
            }
          }

          if (meta.providers) {
            for (const provider of meta.providers) {
              const binding = createBindingFromClass(provider);
              binding.lock();

              this.context.add(binding);

              // Implementation to support the provider injection by values
              // This allows the developer to register a provider by simply
              // adding the @Service(PRODUCED_CLASS) constructor to the meta
              // and when needed just use the @Inject(PRODUCED_CLASS) to
              // resolve the provider's value.
              if (binding.tagNames.includes('product')) {
                // Alias the value to the provider's product @Service(MyProvider)
                this.context.add(
                  new Binding(binding.tagMap.product).toAlias(binding.key),
                );
              } else {
                // Simplified object binding.
                // This allows us to use the @Inject(MyService) syntax

                this.context.add(
                  new Binding(provider.name).toAlias(binding.key),
                );
              }

              this.logger.debug(
                'Bound [%s] with tags [%s]',
                binding.key,
                binding.tagNames.join(','),
              );
            }
          }
        } else {
          throw new Error(`Module [${name}] is missing the @Module decorator`);
        }
      }
    }
  }

  /**
   * @inheritdoc
   */
  bootstrap(modules: Constructor<IModule>[]): boolean {
    this.logger.debug('Bootstrap sequence initialized...');

    try {
      this.register(modules);
      this.logger.info('Bootstrap sequence successful!');

      return true;
    } catch (error) {
      this.logger.error('Bootstrap sequence failed!');
      this.logger.error(getErrorMessage(error));

      return false;
    }
  }

  /**
   * Start the module with a timeout in case the module loops or waits too long
   */
  protected async doStartModule(
    binding: Readonly<Binding<any>>,
    module: IModule,
  ): Promise<void> {
    // Check for start hook
    if (module.onStart) {
      await timeout(
        module
          .onStart(this)
          .then(() =>
            this.logger.debug('Module [%s] started', binding.source.value.name),
          ),
        60_000,
        `Module [${binding.source.value.name}] could not finish it's startup in 60 seconds`,
      );
    }
  }

  /**
   * @inheritdoc
   */
  async start(): Promise<boolean> {
    this.logger.debug('Startup request received');
    this.logger.debug('Invoking the module startup sequence...');

    try {
      const dependencies = this.moduleGraph.overallOrder(false);

      for (const key of dependencies) {
        const binding = this.context.getBinding(key);

        await this.context
          .get<IModule>(binding.key)
          .then(module => this.doStartModule(binding, module));
      }
    } catch (error) {
      this.logger.error('Startup sequence failed!');
      this.logger.error(getErrorMessage(error));
      console.log('Trace', error);

      // Initiate a graceful shutdown so the modules
      // can still close their handles.
      try {
        await this.stop();
      } catch (error) {}

      return false;
    }

    this.logger.info("Startup sequence successful. Let's do this!");

    return true;
  }

  /**
   * Stop the module with a timeout in case the module loops or waits too long
   */
  protected async doStopModule(
    binding: Readonly<Binding<any>>,
    module: IModule,
  ): Promise<void> {
    // Check for stop hook
    if (module.onStop) {
      await timeout(
        module
          .onStop(this)
          .then(() =>
            this.logger.debug('Module [%s] stopped', binding.source.value.name),
          ),
        10_000,
        `Module [${binding.source.value.name}] could not finish it's shutdown in 10 seconds`,
      );
    } else {
      this.logger.debug('Module [%s] stopped', binding.source.value.name);
    }
  }

  /**
   * @inheritdoc
   */
  async stop(): Promise<boolean> {
    this.logger.debug('Shutdown request received');
    this.logger.debug('Invoking the graceful shutdown sequence...');

    try {
      const dependencies = this.moduleGraph.overallOrder(false).reverse();

      for (const key of dependencies) {
        const binding = this.context.getBinding(key);
        await this.context
          .get<IModule>(binding.key)
          .then(module => this.doStopModule(binding, module));
      }
      this.logger.info('Shutdown sequence successful! See You <3');

      return true;
    } catch (error) {
      this.logger.error('Shutdown sequence failed!');
      this.logger.error(getErrorMessage(error));

      return false;
    }
  }
}
