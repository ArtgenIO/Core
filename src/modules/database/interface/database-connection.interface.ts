import { Knex } from 'knex';
import { Model, ModelClass } from 'objection';
import { IDatabase, ITableStructure } from '.';
import { DatabaseSynchronizer } from '..';
import { ISchema } from '../../schema';
import { IConnectionAssociation } from './connection-association.interface';
import { Dialect } from './dialect.type';

export interface IDatabaseConnection {
  readonly synchornizer: DatabaseSynchronizer;

  /**
   * Reference to the database record
   */
  readonly database: IDatabase;

  /**
   * ORM connection
   */
  readonly knex: Knex;

  /**
   * Connection's dialect.
   */
  readonly dialect: Dialect;

  /**
   *
   */
  readonly associations: Map<string, IConnectionAssociation>;

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
  associate(schemas: ISchema[]): Promise<number>;

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

  toDialectSchema(schema: ISchema): ISchema;
  toStructure(schema: ISchema): ITableStructure;
}
