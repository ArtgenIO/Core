import {
  DataType,
  DataTypes,
  Dialect,
  ModelAttributeColumnOptions,
  ModelAttributes,
  ModelOptions,
} from 'sequelize';
import { ISchema } from '../../schema';
import { FieldTag } from '../../schema/interface/field-tags.enum';
import { FieldType } from '../../schema/interface/field-type.enum';
import { getDataTypeFromField } from '../../schema/util/field-mapper';
import { isManagedField, isPrimary } from '../../schema/util/is-primary';

type ModelDefinition = {
  modelName: string;
  attributes: ModelAttributes;
  options: ModelOptions;
};

export const schemaToModel = (
  schema: ISchema,
  dialect: Dialect = 'postgres',
): ModelDefinition => {
  const attributes: ModelAttributes = {};

  for (const field of schema.fields) {
    // Local mapped name
    const ref = field.reference;

    let type: DataType = getDataTypeFromField(field);
    let defaultValue = field?.defaultValue ?? undefined;
    let nullable =
      field.tags.includes(FieldTag.NULLABLE) || isManagedField(field);

    const column: ModelAttributeColumnOptions = {
      type,
      primaryKey: isPrimary(field),
      autoIncrement: false,
      field: field.columnName,
      allowNull: nullable,
      defaultValue,
      unique: field.tags.includes(FieldTag.UNIQUE),
    };

    if (dialect === 'sqlite') {
      if (field.type === FieldType.JSON) {
        column.type = DataTypes.TEXT;
        column.allowNull = true;

        if (column.defaultValue !== null) {
          column.defaultValue = JSON.stringify(column.defaultValue);
        }

        // JSON setter
        column.set = function (value: unknown) {
          this.setDataValue(
            field.reference,
            value ? JSON.stringify(value, null, 0) : null,
          );
        };

        // JSON getter
        column.get = function () {
          const rawValue = this.getDataValue(field.reference);
          return rawValue ? JSON.parse(rawValue) : rawValue;
        };
      }
    }

    if (isPrimary(field) && field.type === FieldType.UUID) {
      column.defaultValue = DataTypes.UUIDV4;
    }

    attributes[ref] = column;
  }

  const createdAt =
    schema.fields.find(s => s.tags.includes(FieldTag.CREATED))?.reference ??
    false;
  const updatedAt =
    schema.fields.find(s => s.tags.includes(FieldTag.UPDATED))?.reference ??
    false;
  const deletedAt =
    schema.fields.find(s => s.tags.includes(FieldTag.DELETED))?.reference ??
    false;
  const version =
    schema.fields.find(s => s.tags.includes(FieldTag.VERSION))?.reference ??
    false;

  const options: ModelOptions = {
    modelName: schema.reference,
    tableName: schema.tableName,
    createdAt,
    updatedAt,
    deletedAt,
    version,
    paranoid: !!version,
    freezeTableName: true,
  };

  return {
    modelName: schema.reference,
    attributes,
    options,
  };
};
