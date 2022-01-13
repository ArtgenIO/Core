import kebabCase from 'lodash.kebabcase';
import { ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';

const routeRestFilterOne = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
) => {
  return schema.fields
    .filter(FieldTool.isPrimary)
    .map(f => record[f.reference])
    .join('/');
};

export const toRestRoute = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(schema.reference)}`;

export const toRestRecordRoute = (
  schema: ISchema,
  record: Record<string, unknown>,
) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(
    schema.reference,
  )}/${routeRestFilterOne(schema, record)}`;
