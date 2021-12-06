import { Model, ModelClass } from 'objection';
import { ISchema } from '../../schema';
import { IDatabaseSchema } from './table-structure.interface';

export interface IAssociation<T extends Model = Model> {
  schema: ISchema;
  structure: IDatabaseSchema;
  model: ModelClass<T>;
  inSync: boolean;
}
