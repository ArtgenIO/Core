import { IKernel } from '../../kernel/interface/kernel.interface';

export interface IModule {
  /**
   * Hook for the application.start event
   */
  onStart?(application: IKernel): Promise<void>;

  /**
   * Hook for the application.stop event
   */
  onStop?(application: IKernel): Promise<void>;
}
