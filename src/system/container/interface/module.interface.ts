import { IApplication } from '../../app/application.interface';

export interface IModule {
  /**
   * Hook for the application.start event
   */
  onStart?(application: IApplication): Promise<void>;

  /**
   * Hook for the application.stop event
   */
  onStop?(application: IApplication): Promise<void>;
}
