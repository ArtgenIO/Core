import { ISchema } from '../../schema';
import { ISchemaStructure } from './schema-structure.interface';

export interface IAssociation {
  schema: ISchema;
  structure: ISchemaStructure;
  inSync: boolean;
}
