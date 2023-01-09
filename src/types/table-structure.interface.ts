import { ISchema } from '../models/schema.interface';
import { IField } from './field.interface';
import { IRelation } from './relation.interface';

export type IColumnSchema = Pick<IField, 'columnName' | 'type' | 'args'>;

/**
 * A smaller subset of the schema object, which only describes the database structure
 * this is used to track if the database needs to synchronized or not.
 */
export interface ITableStructure {
  tableName: ISchema['tableName'];
  columns: {
    [name: string]: IColumnSchema;
  };
  relations: {
    [hash: string]: Pick<IRelation, 'target' | 'localField' | 'remoteField'>;
  };
  uniques: { fields: string[] }[];
  indices: ISchema['indices'];
}
