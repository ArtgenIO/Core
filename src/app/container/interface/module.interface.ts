import { IKernel } from '../../kernel/interface/kernel.interface';

export interface IModule {
  /**
   * Called when the kernel is starting, mapped for dependencies.
   */
  onBoot?(kernel: IKernel): Promise<void>;

  /**
   * Called when the application start is finished, can register the hooks.
   */
  onStart?(kernel: IKernel): Promise<void>;

  /**
   * Called when the kernel is shuting down.
   */
  onStop?(kernel: IKernel): Promise<void>;
}
