import { IKernel } from '../../kernel/interface/kernel.interface';

export interface IModule {
  /**
   * Called when the kernel is starting, mapped for dependencies.
   */
  onStart?(kernel: IKernel): Promise<void>;

  /**
   * Called when the application start is finished, can register the hooks.
   */
  onReady?(kernel: IKernel): Promise<void>;

  /**
   * Called when the kernel is shuting down.
   */
  onStop?(kernel: IKernel): Promise<void>;
}
