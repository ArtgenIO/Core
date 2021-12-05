import { QueryBuilder } from 'odata-query-builder';
import { FieldTag, ICollection } from '../../collection';
import { ContentAction } from '../interface/content-action.enum';

const routeFilterOne = (
  schema: Partial<ICollection>,
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

export const routeCrudUI = (
  schema: Pick<ICollection, 'database' | 'reference'>,
) => `/admin/content/${schema.database}/${schema.reference}`;

export const routeCrudAPI = (
  schema: Pick<ICollection, 'database' | 'reference'>,
) => `/api/content/${schema.database}/${schema.reference}`;

/**
 * Build route to a specific record on the UI
 */
export const routeCrudRecordUI = (
  schema: Partial<ICollection>,
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
  schema: Partial<ICollection>,
  record: Record<string, unknown>,
) => {
  return `/api/content/${schema.database}/${schema.reference}${routeFilterOne(
    schema,
    record,
  )}`;
};
