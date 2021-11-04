import {
  ColumnType,
  DatabaseType,
  EntitySchema,
  EntitySchemaColumnOptions,
  EntitySchemaIndexOptions,
} from 'typeorm';
import { EntitySchemaUniqueOptions } from 'typeorm/entity-schema/EntitySchemaUniqueOptions';
import { ISchema } from '..';
import { FieldTag } from '../interface/field-tags.enum';
import { FieldType } from '../interface/field-type.enum';

export const schemaToEntity = (
  schema: ISchema,
  databaseType: DatabaseType = 'postgres',
): EntitySchema => {
  const columns: { [name: string]: EntitySchemaColumnOptions } = {};

  for (const field of schema.fields) {
    // Local mapped name
    const ref = field.reference;

    let type: ColumnType = field.type;
    let defaultValue = field?.defaultValue ?? undefined;
    let nullable = field.tags.includes(FieldTag.NULLABLE);

    if (databaseType === 'sqlite') {
      if (type === 'json') {
        type = 'simple-json';
      }

      if (type === 'timestamp') {
        type = 'datetime';
      }

      defaultValue = '';
    }

    const column: EntitySchemaColumnOptions = {
      type,
      primary: field.tags.includes(FieldTag.PRIMARY),
      createDate: field.tags.includes(FieldTag.CREATED),
      updateDate: field.tags.includes(FieldTag.UPDATED),
      deleteDate: field.tags.includes(FieldTag.DELETED),
      version: field.tags.includes(FieldTag.VERSION),
      name: field.columnName,
      nullable,
      default: defaultValue,
      unique: field.tags.includes(FieldTag.UNIQUE),
    };

    if (field.tags.includes(FieldTag.PRIMARY)) {
      if (field.type === FieldType.UUID) {
        column.generated = 'uuid';
      } else if (field.type === FieldType.INTEGER) {
        column.generated = 'increment';
      }
    }

    columns[ref] = column;
  }

  const uniques: EntitySchemaUniqueOptions[] = [];

  for (const unq of schema.uniques) {
    uniques.push({
      name: unq.name,
      columns: unq.fields,
    });
  }

  const indices: EntitySchemaIndexOptions[] = [];

  for (const idx of schema.indices) {
    uniques.push({
      name: idx.name,
      columns: idx.fields,
    });
  }

  const entity = new EntitySchema({
    name: schema.reference,
    tableName: schema.tableName,
    schema: undefined, // Can be changed when we introduce the connection with the definition building
    columns: columns,
    indices,
    uniques,
  });

  return entity;
};
