import { Model, ModelClass } from 'objection';
import { ICollection } from '../../collection';
import { IDatabaseSchema } from './table-structure.interface';

export interface IAssociation<T extends Model = Model> {
  schema: ICollection;
  structure: IDatabaseSchema;
  model: ModelClass<T>;
  inSync: boolean;
}
