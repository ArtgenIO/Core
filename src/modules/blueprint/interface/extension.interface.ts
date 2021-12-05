import { ICollection } from '../../collection';
import { ILogic } from '../../logic/interface';

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
  schemas: ICollection[];

  /**
   * Provided workflows
   */
  workflows: ILogic[];
}
