import { Column } from 'knex-schema-inspector/dist/types/column';
import { snakeCase, startCase, upperFirst } from 'lodash';
import { FieldTag, IField, ISchema } from '../../../schema';
import { getFieldTypeFromString } from '../../../schema/util/field-mapper';

export const toSchema = (
  database: string,
  tableName: string,
  columns: Column[],
): ISchema => {
  const schema: ISchema = {
    database,
    reference: upperFirst(snakeCase(tableName)),
    tableName,
    label: upperFirst(snakeCase(tableName)),
    fields: [],
    indices: [],
    uniques: [],
    relations: [],
    permission: 'r',
    icon: 'widgets',
    artboard: {
      position: { x: 0, y: 0 },
    },
    version: 2,
    tags: ['readonly'],
  };

  columns.forEach(col => {
    const field: IField = {
      label: upperFirst(startCase(col.name)),
      reference: snakeCase(col.name),
      columnName: col.name,
      defaultValue: col.default_value,
      ...getFieldTypeFromString(col),
      tags: [],
    };

    if (col.is_primary_key) field.tags.push(FieldTag.PRIMARY);
    if (col.is_nullable) field.tags.push(FieldTag.NULLABLE);
    if (col.is_unique) field.tags.push(FieldTag.UNIQUE);

    schema.fields.push(field);
  });

  return schema;
};
