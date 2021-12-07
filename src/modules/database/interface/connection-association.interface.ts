import { Model, ModelClass } from 'objection';
import { ISchema } from '../../schema';
import { ITableStructure } from './table-structure.interface';

export interface IConnectionAssociation<T extends Model = Model> {
  schema: ISchema;
  structure: ITableStructure;
  model: ModelClass<T>;
  inSync: boolean;
}
