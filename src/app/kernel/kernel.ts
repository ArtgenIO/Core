import {
  Binding,
  BindingAddress,
  BindingScope,
  BindingType,
  Constructor,
  Context,
  createBindingFromClass,
  instantiateClass,
  Reflector,
  ValueOrPromise,
} from '@loopback/context';
import { DepGraph } from 'dependency-graph';
import { default as timeout } from 'p-timeout';
import {
  IContext,
  ILogger,
  IModule,
  IModuleMeta,
  ModuleConcrete,
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
  readonly bootAt: Date = new Date();

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
   * Resolve the moduleRef, and validate the output, referencing is used to
   * resolve circular dependencies, and the wrapper hides the concrete until
   * the JS definition is parsed.
   */
  protected resolveRef(
    module: ModuleConcrete,
    lead: string,
  ): Constructor<IModule> {
    if (typeof module === 'object' && module?.resolve) {
      module = module.resolve();
    }

    // Test for basic module expectations
    if (typeof module !== 'function') {
      throw new Exception(
        `Could not register module [${
          (module as unknown as Constructor<IModule>)?.name ?? module
        }] referenced by [${lead}]!`,
      );
    }

    return module;
  }

  /**
   * Register modules in the dependency container and module load graph.
   */
  protected discover(modules: ModuleConcrete[], lead: string = '__kernel__') {
    for (let module of modules.map(m => this.resolveRef(m, lead))) {
      const name = module.name;
      const key = `module.${name}`;

      if (!this.context.contains(key)) {
        // Register for dependency loading
        if (!this.moduleGraph.hasNode(key)) {
          this.moduleGraph.addNode(key);

          this.logger.debug('Discovered [%s] module by [%s]', name, lead);
        }

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

          // Import sub modules
          if (meta.imports) {
            this.discover(meta.imports, name);
          }

          // Register dependencies
          if (meta.dependsOn) {
            this.discover(meta.dependsOn, name);

            for (let dep of meta.dependsOn.map(m => this.resolveRef(m, lead))) {
              const depKey = `module.${dep.name}`;

              this.logger.debug(
                'Module [%s] is dependent of the [%s] module',
                name,
                dep.name,
              );

              this.moduleGraph.addDependency(key, depKey);
            }
          }

          if (meta.providers) {
            for (const provider of meta.providers) {
              const binding = createBindingFromClass(provider);

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
          throw new Exception(
            `Module [${name}] is missing the @Module decorator`,
          );
        }
      }
    }
  }

  /**
   * @inheritdoc
   */
  register(modules: Constructor<IModule>[]): boolean {
    this.logger.debug('Discovery started...');

    try {
      this.discover(modules);
      this.logger.info('Discovery successful!');

      return true;
    } catch (error) {
      this.logger.error('Discovery failed!');
      this.logger.error(getErrorMessage(error));

      return false;
    }
  }

  /**
   * Start the module with a timeout in case the module loops or waits too long
   */
  protected async doBootModule(
    binding: Binding<Constructor<IModule>>,
    module: IModule,
  ): Promise<void> {
    const value = binding.source.value as Constructor<IModule>;

    // Check for start hook
    if (module.onBoot) {
      await timeout(
        module
          .onBoot(this)
          .then(() => this.logger.debug('Module [%s] started', value.name)),
        60_000,
        `Module [${value.name}] could not finish it's boot in 60 seconds`,
      );
    }
  }

  /**
   * @inheritdoc
   */
  async boostrap(): Promise<boolean> {
    this.logger.debug('Boostrap request received');
    this.logger.debug('Invoking the module bootstrap sequence...');

    try {
      const dependencies = this.moduleGraph.overallOrder(false);

      for (const key of dependencies) {
        const binding = this.context.getBinding<Constructor<IModule>>(key);

        await this.context
          .get<IModule>(binding.key)
          .then(module => this.doBootModule(binding, module));
      }
    } catch (error) {
      this.logger.error('Bootstrap sequence failed!');
      this.logger.error(getErrorMessage(error));
      console.error(error);

      // Initiate a graceful shutdown so the modules
      // can still close their handles.
      await this.stop();

      return false;
    }

    this.logger.info("Bootstrap successful. Let's do this!");

    return true;
  }

  /**
   * @inheritdoc
   */
  async start() {
    const processes = [];

    // Propagate the onStart event, so the modules can register their late handles.
    // Unlike the on boot event, this does not have to be in any specific order.
    for (const binding of this.context.findByTag<any>('module')) {
      const module: IModule = await binding.getValue(this.context);

      if (module?.onStart) {
        processes.push(
          module
            .onStart(this)
            .then(() =>
              this.logger.debug(
                'Module [%s] started',
                binding.source.value.name,
              ),
            )
            .catch(e =>
              this.logger
                .warn(
                  'Module [%s] had an unhandled exception in the start hook',
                  binding.source.value.name,
                )
                .warn(getErrorMessage(e)),
            ),
        );
      }
    }

    await Promise.all(processes);

    this.logger.info('Startup procedure is finished, application is ready!');
  }

  /**
   * Stop the module with a timeout in case the module loops or waits too long
   */
  protected async doStopModule(
    binding: Readonly<Binding<Constructor<IModule>>>,
    module: IModule,
  ): Promise<void> {
    const value = binding.source.value as Constructor<IModule>;

    // Check for stop hook
    if (module.onStop) {
      await timeout(
        module
          .onStop(this)
          .then(() => this.logger.debug('Module [%s] stopped', value.name)),
        10_000,
        `Module [${value.name}] could not finish it's shutdown in 10 seconds`,
      );
    } else {
      this.logger.debug('Module [%s] stopped', value.name);
    }
  }

  /**
   * @inheritdoc
   */
  async stop(): Promise<boolean> {
    this.logger.debug('Shutdown request received');
    this.logger.debug('Invoking the graceful shutdown sequence...');

    const dependencies = this.moduleGraph.overallOrder(false).reverse();
    let dirty = false;

    for (const key of dependencies) {
      const binding = this.context.getBinding(key);

      await this.context.get<IModule>(binding.key).then(module =>
        this.doStopModule(binding, module).catch(e => {
          this.logger
            .warn(
              'Module [%s] had an unhandled exception in the stop hook',
              binding.source.value.name,
            )
            .warn(getErrorMessage(e));

          dirty = true;
        }),
      );
    }

    this.logger.info('Shutdown sequence successful! See You <3');

    return !dirty;
  }

  /**
   * @inheritdoc
   */
  replace(key: BindingAddress | Constructor<object>, value: any): void {
    // Binding key can be a class and we use the class's name to resolve it.
    if (typeof key === 'function') {
      if (key?.name) {
        key = key.name;
      }
    }

    key = key as BindingAddress;

    if (!this.context.contains(key)) {
      throw new Exception(`Binding [${key}] is not registered`);
    }

    const binding = this.context.getBinding(key);

    // Clear the cached resolution.
    binding.refresh(this.context);

    switch (binding.type) {
      case BindingType.CONSTANT:
        binding.to(value);
        break;
      case BindingType.DYNAMIC_VALUE:
        binding.toDynamicValue(value);
        break;
      case BindingType.CLASS:
        binding.toClass(value);
        break;
      case BindingType.PROVIDER:
        binding.toProvider(value);
        break;
      case BindingType.ALIAS:
        return this.replace(binding.source.value as string, value);
    }
  }

  /**
   * @inheritdoc
   */
  async get<T>(key: BindingAddress<T> | Constructor<object>): Promise<T> {
    // Binding key can be a class and we use the class's name to resolve it.
    if (typeof key === 'function') {
      if (key?.name) {
        key = key.name;
      }
    }

    key = key as BindingAddress;

    return this.context.get<T>(key);
  }

  /**
   * @inheritdoc
   */
  create<T>(concrete: Constructor<T>, params?: any[]): ValueOrPromise<T> {
    return instantiateClass(concrete, this.context, undefined, params);
  }
}
