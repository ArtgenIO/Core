import kebabCase from 'lodash.kebabcase';
import { QueryBuilder } from 'odata-query-builder';
import { RowLike } from '../../../app/interface/row-like.interface';
import { ISchema } from '../../schema';
import { SchemaRef } from '../../schema/interface/system-ref.enum';
import { FieldTool } from '../../schema/util/field-tools';

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
