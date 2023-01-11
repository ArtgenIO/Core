import { RowLike } from '../api/types/row-like.interface';
import { ISchema } from './schema.interface';

export interface IBlueprint {
  /**
   * UUID
   */
  id: string;

  /**
   * Display name
   */
  title: string;

  cover: string;

  description: string;

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
   * Provided schemas
   */
  schemas: ISchema[];

  /**
   * Provided schemas
   */
  content: {
    [schema: string]: RowLike[];
  };
}
