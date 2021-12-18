import kebabCase from 'lodash.kebabcase';
import { QueryBuilder } from 'odata-query-builder';
import { FieldTag, ISchema } from '../../schema';
import { ContentAction } from '../interface/content-action.enum';

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

export const routeCrudUI = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/admin/content/${schema.database}/${schema.reference}`;

export const routeCrudAPI = (schema: Pick<ISchema, 'database' | 'reference'>) =>
  `/api/odata/${kebabCase(schema.database)}/${kebabCase(schema.reference)}`;

/**
 * Build route to a specific record on the UI
 */
export const routeCrudRecordUI = (
  schema: Partial<ISchema>,
  record: Record<string, unknown>,
  action: ContentAction,
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
