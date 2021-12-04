import { IField, ISchema } from '../../schema';
import { IRelation } from '../../schema/interface/relation.interface';

type IFieldStructure = Pick<IField, 'columnName' | 'type' | 'typeParams'>;

/**
 * A smaller subset of the schema object, which only describes the database structure
 * this is used to track if the database needs to synchronized or not.
 */
export interface ISchemaStructure {
  tableName: ISchema['tableName'];
  fields: IFieldStructure[];
  relations: Pick<IRelation, 'target' | 'localField' | 'remoteField'>[];
  uniques: ISchema['uniques'];
  indices: ISchema['indices'];
}
