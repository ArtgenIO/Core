import { Knex } from 'knex';
import { Model, ModelClass } from 'objection';
import { IDatabase } from '.';
import { ICollection } from '../../collection';
import { IAssociation } from './association.interface';

export interface IConnection {
  /**
   * Reference to the database record
   */
  readonly database: IDatabase;

  /**
   * ORM connection
   */
  readonly knex: Knex;

  /**
   *
   */
  getAssications(): Map<string, IAssociation>;

  /**
   * Get the unique name for the database link.
   */
  getName(): string;

  /**
   * Get the model by reference
   */
  getModel<T extends Model = Model>(reference: string): ModelClass<T>;

  /**
   * Add schema to the existing set, this function builds diff to the existing
   * sync, and analyzes if the schema needs to be changed.
   *
   * It may strip invalid relations until the referenced schema is added.
   */
  associate(schemas: ICollection[]): Promise<IConnection>;

  /**
   * Get the associated schemas.
   */
  getSchemas(): ICollection[];

  /**
   * Get the associated schema.
   */
  getSchema(reference: string): ICollection;

  /**
   * Close the connection to the database.
   */
  close(): Promise<void>;
}
