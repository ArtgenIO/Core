import { BindingAddress, Constructor, ValueOrPromise } from '@loopback/context';
import { IContext, ILogger, IModule } from '../../container';

export interface IKernel {
  /**
   * Global context with the 'app' identifier, every class uses this for injection.
   */
  readonly context: IContext;

  /**
   * Global base logger, every injection uses a child from this.
   */
  readonly logger: ILogger;

  /**
   * When the instance started.
   */
  readonly bootAt: Date;

  /**
   * Registers kernel modules
   */
  register(modules: Constructor<IModule>[]): boolean;

  /**
   * Bootstrap the kernel and invoke the modules
   */
  boostrap(): Promise<boolean>;

  /**
   * Invoke the ready hooks
   */
  start(): Promise<void>;

  /**
   * Stop the kernel and propagate the shutdown request to the modules
   */
  stop(): Promise<boolean>;

  /**
   * Inject a binding into the context, allows us to replace existing providers.
   */
  replace(key: BindingAddress | Constructor<object>, value: any): void;

  /**
   * Custom context resolver with support for the instance based resolution.
   *
   * @example kernel.make(ConnectionService)
   */
  get<T>(key: Constructor<T>): Promise<T>;
  get<T>(key: BindingAddress<T> | Constructor<object>): Promise<T>;

  /**
   * Create an instance from the given concrete in the kernel's resolution context
   */
  create<T>(
    concrete: Constructor<T>,
    nonInjectedArgs?: any[],
  ): ValueOrPromise<T>;
}
