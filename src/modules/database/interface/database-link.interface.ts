import { Model, ModelCtor, Sequelize } from 'sequelize';
import { IDatabase } from '.';
import { ISchema } from '../../schema';

export interface IDatabaseLink {
  /**
   * Reference to the database record
   */
  readonly database: IDatabase;

  /**
   * ORM connection
   */
  readonly connection: Sequelize;

  /**
   * Get the unique name for the database link.
   */
  getName(): string;

  /**
   * Get the model by reference
   */
  getModel<T = unknown>(reference: string): ModelCtor<Model<T, T>>;

  /**
   * Add schema to the existing set, this function builds diff to the existing
   * sync, and analyzes if the schema needs to be changed.
   *
   * It may strip invalid relations until the referenced schema is added.
   */
  associate(schemas: ISchema[]): Promise<void>;

  /**
   * Get the associated schemas.
   */
  getSchemas(): ISchema[];

  /**
   * Close the connection to the database.
   */
  close(): Promise<void>;
}
