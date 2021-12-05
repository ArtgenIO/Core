import { Model, ModelClass, Pojo } from 'objection';
import { v4 } from 'uuid';
import { FieldTag, FieldType, ICollection } from '../../collection/interface';
import { isPrimary } from '../../collection/util/field-tools';

// Map database columns to code level references
const toProperty = (schema: ICollection) => {
  const columnMap = new Map<string, string>(
    schema.fields.map(f => [f.columnName, f.reference]),
  );

  return (database: Pojo): Pojo => {
    const code = {};

    for (const columnName in database) {
      if (Object.prototype.hasOwnProperty.call(database, columnName)) {
        if (columnMap.has(columnName)) {
          code[columnMap.get(columnName)] = database[columnName];
        }
      }
    }

    return code;
  };
};

// Map code level references to database columns
const toColumn = (schema: ICollection) => {
  const referenceMap = new Map<string, string>(
    schema.fields.map(f => [f.reference, f.columnName]),
  );

  return (code: Pojo): Pojo => {
    const database = {};

    for (const referenceName in code) {
      if (Object.prototype.hasOwnProperty.call(code, referenceName)) {
        if (referenceMap.has(referenceName)) {
          database[referenceMap.get(referenceName)] = code[referenceName];
        }
      }
    }

    return database;
  };
};

// Hook before the model is created
const onCreate = (schema: ICollection) => {
  const primaryKeys = schema.fields.filter(isPrimary);
  const hasUUIDPK =
    primaryKeys.length === 1 && primaryKeys[0].type === FieldType.UUID;
  const createdAt = schema.fields.find(f => f.tags.includes(FieldTag.CREATED));
  const versioned = schema.fields.find(f => f.tags.includes(FieldTag.VERSION));

  return function () {
    if (createdAt) {
      this[createdAt.reference] = new Date().toISOString();
    }

    if (hasUUIDPK) {
      if (!this[primaryKeys[0].reference]) {
        this[primaryKeys[0].reference] = v4();
      }
    }

    if (versioned) {
      if (!this[versioned.reference]) {
        this[versioned.reference] = 0;
      }
    }
  };
};

// Hook before the model is updated
const onUpdate = (schema: ICollection) => {
  const updatedAt = schema.fields.find(f => f.tags.includes(FieldTag.UPDATED));
  const versioned = schema.fields.find(f => f.tags.includes(FieldTag.VERSION));

  return function () {
    if (updatedAt) {
      this[updatedAt.reference] = new Date().toISOString();
    }

    if (versioned) {
      this[versioned.reference] = (this[versioned.reference] ?? 0) + 1;
    }
  };
};

/**
 * Convert a schema into a model definition adjusted to the database's dialect.
 */
export const toModel = (schema: ICollection): ModelClass<Model> => {
  const model = class extends Model {};

  model.tableName = schema.tableName;
  model.idColumn = schema.fields.filter(isPrimary).map(f => f.reference);

  model.columnNameMappers = {
    parse: toProperty(schema),
    format: toColumn(schema),
  };

  model.prototype.$beforeInsert = onCreate(schema);
  model.prototype.$beforeUpdate = onUpdate(schema);

  const jsonFields = schema.fields.filter(
    f => f.type === FieldType.JSON || f.type === FieldType.JSONB,
  );

  if (jsonFields) {
    model.jsonAttributes = jsonFields.map(f => f.reference);
  }

  return model;
};
