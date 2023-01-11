import kebabCase from 'lodash.kebabcase';
import { QueryBuilder } from 'odata-query-builder';
import { FieldTool } from '../../../api/library/field-tools';
import { RowLike } from '../../../api/types/row-like.interface';
import { SchemaRef } from '../../../api/types/system-ref.enum';
import { ISchema } from '../../../models/schema.interface';

const routeRestFilterOne = (schema: Partial<ISchema>, record: RowLike) => {
  return schema.fields
    .filter(FieldTool.isPrimary)
    .map(f => record[f.reference])
    .join('/');
};

export const toRestRoute = (
  schema: Pick<ISchema, 'database' | 'reference'>,
  qbc?: (qb: QueryBuilder) => QueryBuilder,
) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(schema.reference)}` +
  (qbc ? qbc(new QueryBuilder()).toQuery() : '');

export const toRestSysRoute = (
  reference: SchemaRef,
  qbc?: (qb: QueryBuilder) => QueryBuilder,
) =>
  `/api/rest/main/${kebabCase(reference)}` +
  (qbc ? qbc(new QueryBuilder()).toQuery() : '');

export const toRestRecordRoute = (schema: ISchema, record: RowLike) =>
  `/api/rest/${kebabCase(schema.database)}/${kebabCase(
    schema.reference,
  )}/${routeRestFilterOne(schema, record)}`;
