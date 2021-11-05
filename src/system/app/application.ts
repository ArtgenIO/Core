import {
  Binding,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  Reflector,
} from '@loopback/context';
import chalk from 'chalk';
import config from 'config';
import { DepGraph } from 'dependency-graph';
import { default as timeout } from 'p-timeout';
import { createLogger as factory, format } from 'winston';
import { Console } from 'winston/lib/winston/transports';
import {
  IContext,
  ILogger,
  IModule,
  IModuleMeta,
  MODULE_KEY,
} from '../container';
import { IApplication } from './application.interface';
import { getErrorMessage } from './util/extract-error';

const { combine, timestamp, printf, splat } = format;

export class Application implements IApplication {
  readonly id: string;
  readonly context: IContext;
  readonly logger: ILogger;
  readonly dependencyGraph: DepGraph<void>;

  constructor() {
    this.id = config.get('id');
    this.logger = this.createLogger();
    this.logger.debug('Creating the context...');

    this.context = new Context('app');
    this.context.bind('Application').to(this);

    this.logger.info('Context is ready!');

    this.dependencyGraph = new DepGraph();
  }

  protected createLogger(): ILogger {
    console.clear();

    const levels = {
      debug: chalk.magenta('debug'),
      info: chalk.blue('info'),
      warn: chalk.yellow('warn'),
      error: chalk.red('error'),
      http: chalk.gray('http'),
      verbose: chalk.gray('verbose'),
    };
    const variable = chalk.yellow('$1');
    const application = chalk.cyan(this.id);

    const loggedAt = timestamp({
      format: 'hh:mm:ss.SSS',
    });

    const logger = factory({
      handleExceptions: false,
      transports: [
        new Console({
          level: 'debug',
          stderrLevels: ['warn', 'error'],
          consoleWarnLevels: ['warn', 'error'],
          handleExceptions: false,
          format: combine(
            loggedAt,
            splat(),
            printf(({ timestamp, level, message, scope }) => {
              message = message
                ? message.replace(/\[([^\]]+)\]/g, '[' + variable + ']')
                : '';

              return `[${application}][${chalk.gray(timestamp)}][${
                levels[level]
              }][${chalk.green(scope ?? 'Application')}] ${message} `;
            }),
          ),
        }),
      ],
      exitOnError: false,
    });

    return logger;
  }

  protected register(modules: Constructor<IModule>[]) {
    for (const module of modules) {
      // Test for basic module expectations
      if (typeof module !== 'function') {
        throw new Error(
          `Could not register [${(
            module as unknown
          ).toString()}], it's not a constructor!`,
        );
      }

      const name = module.name;
      const key = `module.${name}`;

      // Register the module in the context
      if (!this.context.contains(key)) {
        // Register for dependency loading
        if (!this.dependencyGraph.hasNode(key)) {
          this.dependencyGraph.addNode(key);
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

          // Register dependency
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
              if (!this.dependencyGraph.hasNode(dependencyKey)) {
                this.dependencyGraph.addNode(dependencyKey);
              }

              this.dependencyGraph.addDependency(key, dependencyKey);
            }
          }

          if (meta.providers) {
            for (const provider of meta.providers) {
              const binding = createBindingFromClass(provider);
              this.context.add(binding);

              if (binding.tagNames.includes('provides')) {
                // @Service(MyProvider)
                const objectBinding = new Binding(
                  binding.tagMap.provides,
                ).toAlias(binding.key);

                if (this.context.contains(objectBinding.key)) {
                  throw new Error(
                    `Binding [${objectBinding.key}] is already bound to the context`,
                  );
                }
                this.context.add(objectBinding);
              } else {
                // Simplified object binding.
                // This allows us to use the @Inject(MyService) syntax
                const objectBinding = new Binding(provider.name).toAlias(
                  binding.key,
                );

                if (this.context.contains(objectBinding.key)) {
                  throw new Error(
                    `Binding [${objectBinding.key}] is already bound to the context`,
                  );
                }
                this.context.add(objectBinding);
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

  async start(): Promise<boolean> {
    this.logger.debug('Startup request received');
    this.logger.debug('Invoking the module startup sequence...');

    try {
      const dependencies = this.dependencyGraph.overallOrder(false);

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
    }
  }

  async stop(): Promise<boolean> {
    this.logger.debug('Shutdown request received');
    this.logger.debug('Invoking the graceful shutdown sequence...');

    try {
      const dependencies = this.dependencyGraph.overallOrder(false);

      for (const key of dependencies.reverse()) {
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
