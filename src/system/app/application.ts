import {
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  Reflector,
} from '@loopback/context';
import chalk from 'chalk';
import config from 'config';
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

  constructor() {
    this.id = config.get('id');
    this.logger = this.createLogger();

    this.logger.debug('Creating the context...');

    this.context = new Context('app');
    this.context.bind('Application').to(this);

    this.logger.info('Context is ready!');
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
        this.logger.debug('Discovered [%s] dependency', name);

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

          // Module imports submodules
          if (meta.imports) {
            this.register(meta.imports);
          }

          if (meta.providers) {
            for (const provider of meta.providers) {
              const binding = createBindingFromClass(provider);
              this.context.add(binding);

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

  async start(): Promise<boolean> {
    this.logger.debug('Startup request received');
    this.logger.debug('Invoking the module startup sequence...');

    try {
      await Promise.all(
        this.context.findByTag('module').map(binding =>
          this.context.get<IModule>(binding.key).then(module =>
            module?.onStart
              ? timeout(
                  module
                    .onStart(this)
                    .then(() =>
                      this.logger.debug(
                        'Module [%s] started',
                        binding.source.value.name,
                      ),
                    ),
                  60_000,
                  `Module [${binding.source.value.name}] could not finish it's startup in 60 seconds`,
                )
              : null,
          ),
        ),
      );
    } catch (error) {
      this.logger.error('Startup sequence failed!');
      this.logger.error(getErrorMessage(error));

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

  async stop(): Promise<boolean> {
    this.logger.debug('Shutdown request received');
    this.logger.debug('Invoking the graceful shutdown sequence...');

    try {
      await Promise.all(
        this.context.findByTag('module').map(binding =>
          this.context.get<IModule>(binding.key).then(module =>
            module?.onStop
              ? timeout(
                  module
                    .onStop(this)
                    .then(() =>
                      this.logger.debug(
                        'Module [%s] stopped',
                        binding.source.value.name,
                      ),
                    ),
                  100,
                  `Module [${binding.source.value.name}] could not finish it's shutdown in 10 seconds`,
                )
              : null,
          ),
        ),
      );
      this.logger.info('Shutdown sequence successful! See You <3');

      return true;
    } catch (error) {
      this.logger.error('Shutdown sequence failed!');
      this.logger.error(getErrorMessage(error));

      return false;
    }
  }
}
