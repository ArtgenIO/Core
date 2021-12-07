import { IField, ISchema } from '../../schema';
import { IRelation } from '../../schema/interface/relation.interface';

type IColumnSchema = Pick<IField, 'columnName' | 'type' | 'typeParams'>;

/**
 * A smaller subset of the schema object, which only describes the database structure
 * this is used to track if the database needs to synchronized or not.
 */
export interface ITableStructure {
  tableName: ISchema['tableName'];
  columns: IColumnSchema[];
  relations: Pick<IRelation, 'target' | 'localField' | 'remoteField'>[];
  uniques: { fields: string[] }[];
  indices: ISchema['indices'];
}
