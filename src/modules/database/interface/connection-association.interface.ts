import { Model, ModelClass } from 'objection';
import { ISchema } from '../types/schema.interface';
import { ITableStructure } from './table-structure.interface';

export interface IConnectionAssociation<T extends Model = Model> {
  schema: ISchema;
  structure: ITableStructure;
  model: ModelClass<T>;
  inSync: boolean;
}
