import { Model, ModelClass } from 'objection';
import { ISchema } from '../../schema';
import { ISchemaStructure } from './schema-structure.interface';

export interface IAssociation<T extends Model = Model> {
  schema: ISchema;
  structure: ISchemaStructure;
  model: ModelClass<T>;
  inSync: boolean;
}
