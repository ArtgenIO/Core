import {
  DataType,
  DataTypes,
  Dialect,
  ModelAttributeColumnOptions,
  ModelAttributes,
  ModelOptions,
} from 'sequelize';
import { ISchema } from '../../../content/schema';
import { FieldTag } from '../../../content/schema/interface/field-tags.enum';
import { FieldType } from '../../../content/schema/interface/field-type.enum';
import { isPrimary } from '../../../content/schema/util/is-primary';

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

    let type: DataType;
    let defaultValue = field?.defaultValue ?? undefined;
    let nullable = field.tags.includes(FieldTag.NULLABLE);

    switch (field.type) {
      case FieldType.BOOLEAN:
        type = DataTypes.BOOLEAN;
        break;
      case FieldType.DATE:
        type = DataTypes.DATE;
        break;
      case FieldType.INTEGER:
        type = DataTypes.INTEGER;
        break;
      case FieldType.JSON:
        type = DataTypes.JSON;
        break;
      case FieldType.TEXT:
        type = DataTypes.TEXT;
        break;
      case FieldType.UUID:
        type = DataTypes.UUID;
        break;
    }

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

  const options: ModelOptions = {
    modelName: schema.reference,
    tableName: schema.tableName,
    createdAt:
      schema.fields.find(s => s.tags.includes(FieldTag.CREATED))?.columnName ??
      false,
    updatedAt:
      schema.fields.find(s => s.tags.includes(FieldTag.UPDATED))?.columnName ??
      false,
    deletedAt:
      schema.fields.find(s => s.tags.includes(FieldTag.DELETED))?.columnName ??
      false,
    version:
      schema.fields.find(s => s.tags.includes(FieldTag.VERSION))?.columnName ??
      false,
    paranoid: !!schema.fields.find(s => s.tags.includes(FieldTag.VERSION)),
    freezeTableName: true,
  };

  return {
    modelName: schema.reference,
    attributes,
    options,
  };
};
