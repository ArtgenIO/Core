import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { camelCase, snakeCase, startCase, upperFirst } from 'lodash';
import { FieldTag, FieldType, IField, ISchema } from '../../../schema';
import {
  IRelation,
  RelationKind,
} from '../../../schema/interface/relation.interface';
import { getFieldTypeFromString } from '../../../schema/util/field-mapper';
import { isPrimary } from '../../../schema/util/field-tools';
import { IConnection } from '../../interface';
import { Unique } from '../../interface/inspector.interface';
import { Inspector } from '../inspector/inspector';

type EnumColumn = { column: string; values: string[] };

export const toSchema = async (
  database: string,
  tableName: string,
  columns: Column[],
  foreignKeys: ForeignKey[],
  uniques: Unique[],
  link: IConnection,
  inspector: Inspector,
): Promise<ISchema> => {
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

  const compositUniques = uniques.filter(unq => unq.columns.length > 1);
  const columnUniques = uniques
    .filter(unq => unq.columns.length === 1)
    .map(unq => unq.columns[0]);

  const enums: EnumColumn[] = [];

  // SQLite uses enum with value checks so we need to find every enum like check ~
  if (inspector.dialect == 'sqlite') {
    enums.push(...(await inspector.getEnumerators(tableName, columns)));
  }

  for (const col of columns) {
    const field: IField = {
      label: upperFirst(startCase(col.name)),
      reference: camelCase(col.name),
      columnName: col.name,
      defaultValue: col.default_value,
      type: FieldType.STRING,
      typeParams: {
        values: [],
      },
      tags: [],
    };

    // Need to reverse the type (PG)
    if (col.data_type === 'USER-DEFINED') {
      const sType = await inspector.getType(tableName, col.name);
      field.type = sType.type;
      field.typeParams = sType.typeParams;
    } else {
      const revType = getFieldTypeFromString(col);
      field.type = revType.type;
      field.typeParams = revType.typeParams;
    }

    if (inspector.dialect == 'sqlite') {
      // SQLite enum check hack
      if (enums.length) {
        const enumReplace = enums.find(e => e.column == field.columnName);

        if (enumReplace) {
          field.type = FieldType.ENUM;
          field.typeParams.values = enumReplace.values;
        }
      }
    } else if (inspector.dialect === 'mysql') {
      if (field.type == FieldType.TEXT) {
        if (field.typeParams?.length == 65535) {
          delete field.typeParams.length;
        }
      }
    }

    if (col.is_primary_key) field.tags.push(FieldTag.PRIMARY);
    if (col.is_nullable) field.tags.push(FieldTag.NULLABLE);
    if (col.is_unique || columnUniques.includes(col.name))
      field.tags.push(FieldTag.UNIQUE);

    schema.fields.push(field);
  }

  foreignKeys.forEach(foreign => {
    const target = link
      .getSchemas()
      .find(s => s.tableName === foreign.foreign_key_table);
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

  compositUniques.forEach(cuniq => {
    schema.uniques.push({
      name: cuniq.name.replace(schema.tableName, ''),
      fields: cuniq.columns.map(
        col => schema.fields.find(f => f.columnName === col).reference,
      ),
    });
  });

  return schema;
};
