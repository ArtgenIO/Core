import kebabCase from 'lodash.kebabcase';
import { RowLike } from '../../../app/interface/row-like.interface';
import { ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';

const routeRestFilterOne = (schema: Partial<ISchema>, record: RowLike) => {
  return schema.fields
    .filter(FieldTool.isPrimary)
    .map(f => record[f.reference])
    .join('/');
};

export const toRestRoute = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(schema.reference)}`;

export const toRestRecordRoute = (schema: ISchema, record: RowLike) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(
    schema.reference,
  )}/${routeRestFilterOne(schema, record)}`;
