import kebabCase from 'lodash.kebabcase';
import { QueryBuilder } from 'odata-query-builder';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { FieldTag, ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';

const routeFilterOne = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
) => {
  const primaryKeys = schema.fields
    .filter(f => f.tags.includes(FieldTag.PRIMARY))
    .map(f => f.reference);

  return new QueryBuilder()
    .top(1)
    .filter(f => {
      for (const primaryKey of primaryKeys) {
        f.filterExpression(primaryKey, 'eq', record[primaryKey].toString());
      }

      return f;
    }, 'and')
    .toQuery();
};

const routeRestFilterOne = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
) => {
  return schema.fields
    .filter(FieldTool.isPrimary)
    .map(f => record[f.reference])
    .join('/');
};

export const routeCrudUI = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/admin/content/${schema.database}/${schema.reference}`;

export const toODataRoute = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/api/odata/${kebabCase(schema.database)}/${kebabCase(schema.reference)}`;

export const toRestRoute = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(schema.reference)}`;

export const toRestRecordRoute = (
  schema: ISchema,
  record: Record<string, unknown>,
) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(
    schema.reference,
  )}/${routeRestFilterOne(schema, record)}`;

/**
 * Build route to a specific record on the UI
 */
export const routeCrudRecordUI = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
  action: CrudAction,
) => {
  return `/admin/content/${schema.database}/${
    schema.reference
  }/${action}${routeFilterOne(schema, record)}`;
};

/**
 * Build route to a specific record on the API
 */
export const routeCrudRecordAPI = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
) => {
  return `/api/odata/${kebabCase(schema.database)}/${kebabCase(
    schema.reference,
  )}${routeFilterOne(schema, record)}`;
};
