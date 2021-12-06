import { ILogic } from '../../logic/interface';
import { ISchema } from '../../schema';

export interface IExtension {
  /**
   * UUID
   */
  id: string;

  /**
   * Custom icon
   */
  icon?: string;

  /**
   * Display name
   */
  label: string;

  /**
   * SemVer
   */
  version: string;

  /**
   * Extension installed from
   */
  source: 'cloud' | 'offline';

  /**
   * Target database name
   */
  database: string;

  /**
   * KeyValue configurations
   */
  config: Record<string, string>;

  /**
   * Provided schemas
   */
  schemas: ISchema[];

  /**
   * Provided workflows
   */
  workflows: ILogic[];
}
