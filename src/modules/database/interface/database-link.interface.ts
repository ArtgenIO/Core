import { Knex } from 'knex';
import { Model, ModelClass } from 'objection';
import { IDatabase } from '.';
import { ISchema } from '../../schema';
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
  getModel(reference: string): ModelClass<Model>;

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
   * Get the associated schema.
   */
  getSchema(reference: string): ISchema;

  /**
   * Close the connection to the database.
   */
  close(): Promise<void>;
}
