import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { snakeCase, startCase, upperFirst } from 'lodash';
import { FieldTag, IField, ISchema } from '../../schema';
import {
  IRelation,
  RelationKind,
} from '../../schema/interface/relation.interface';
import { getFieldTypeFromString } from '../../schema/util/field-mapper';
import { isPrimary } from '../../schema/util/field-tools';
import { IConnection } from '../interface';

export const toSchema = (
  database: string,
  tableName: string,
  columns: Column[],
  foreignKeys: ForeignKey[],
  link: IConnection,
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

  foreignKeys.forEach(foreign => {
    const target = link.getSchemas().find(s => s.tableName);
    const localField = schema.fields.find(f => f.columnName == foreign.column);
    const remoteField = target.fields.find(
      f => f.columnName === foreign.foreign_key_column,
    );
    const remotePKs = target.fields.filter(isPrimary);
    // When the remote has multiple PKs then it must be a connection table
    // TODO do reverse checks to see which other table has FK on the target table to determin who is the real target in M:M
    const kind =
      remotePKs.length === 1
        ? RelationKind.BELONGS_TO_ONE
        : RelationKind.BELONGS_TO_MANY;

    const relation: IRelation = {
      name: foreign.constraint_name,
      kind,
      target: target.reference,
      localField: localField.reference,
      remoteField: remoteField.reference,
      through: undefined,
    };

    schema.relations.push(relation);
  });

  return schema;
};
