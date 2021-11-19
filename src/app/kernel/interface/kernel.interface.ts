import { Constructor } from '@loopback/context';
import { IContext, ILogger, IModule } from '../../container';

export interface IKernel {
  /**
   * Global context with the 'app' identifier, every class uses this for injection.
   */
  readonly context: IContext;

  /**
   * Global base logger, every injection uses a child context from this.
   */
  readonly logger: ILogger;

  /**
   * Registers the kernel modules
   */
  bootstrap(modules: Constructor<IModule>[]): boolean;

  /**
   * Start the kernel and invoke the modules
   */
  start(): Promise<boolean>;

  /**
   * Stop the kernel and propagate the shutdown request to the modules
   */
  stop(): Promise<boolean>;
}
