import { Constructor } from '@loopback/context';
import { IContext, ILogger, IModule } from '../container';

export interface IApplication {
  /**
   * Environment configured unique identifier,
   * used when the application is running in scaled multi node mode.
   */
  readonly id: string;

  /**
   * Global context with the 'app' identifier, every class uses this for injection.
   */
  readonly context: IContext;

  /**
   * Global base logger, every injection uses a child context from this.
   */
  readonly logger: ILogger;

  /**
   * Register the system modules
   */
  bootstrap(modules: Constructor<IModule>[]): boolean;

  /**
   * Start the application and invoke the modules
   */
  start(): Promise<boolean>;

  /**
   * Stop the application and propagate the shutdown request to the modules
   */
  stop(): Promise<boolean>;
}
