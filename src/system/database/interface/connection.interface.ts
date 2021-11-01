import { DatabaseType, ObjectID } from 'typeorm';

export interface IConnection {
  readonly id: string | ObjectID;

  /**
   * Systematic name
   */
  name: string;

  /**
   * Database type
   */
  type: DatabaseType;

  /**
   * Connection URL
   */
  url: string;
}
