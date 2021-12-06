import {
  Model,
  ModelClass,
  Pojo,
  RelationMappings,
  RelationType,
} from 'objection';
import { v4 } from 'uuid';
import { FieldTag, FieldType, ISchema } from '../../../schema/interface';
import { RelationKind } from '../../../schema/interface/relation.interface';
import { isPrimary } from '../../../schema/util/field-tools';
import { IConnection } from '../../interface';

// Map database columns to code level references
const toProperty = (schema: ISchema) => {
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
const toColumn = (schema: ISchema) => {
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
const onCreate = (schema: ISchema) => {
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
const onUpdate = (schema: ISchema) => {
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
export const toModel = (collection: ISchema): ModelClass<Model> => {
  const model = class extends Model {};

  model.tableName = collection.tableName;
  model.idColumn = collection.fields.filter(isPrimary).map(f => f.reference);

  model.columnNameMappers = {
    parse: toProperty(collection),
    format: toColumn(collection),
  };

  model.prototype.$beforeInsert = onCreate(collection);
  model.prototype.$beforeUpdate = onUpdate(collection);

  const jsonFields = collection.fields.filter(
    f => f.type === FieldType.JSON || f.type === FieldType.JSONB,
  );

  if (jsonFields) {
    model.jsonAttributes = jsonFields.map(f => f.reference);
  }

  return model;
};

export const addRelations = (
  model: ModelClass<Model>,
  collection: ISchema,
  connection: IConnection,
) => {
  const relationMappings: RelationMappings = {};

  for (const rel of collection.relations) {
    let type: RelationType;

    switch (rel.kind) {
      case RelationKind.BELONGS_TO_ONE:
        type = Model.BelongsToOneRelation;
        break;
      case RelationKind.HAS_ONE:
        type = Model.HasOneRelation;
        break;
      case RelationKind.HAS_MANY:
        type = Model.HasManyRelation;
        break;
      case RelationKind.BELONGS_TO_MANY:
        type = Model.ManyToManyRelation;
        break;
    }

    const targetModel = connection.getModel(rel.target);
    const targetSchema = connection.getSchema(rel.target);

    relationMappings[rel.name] = {
      relation: type,
      modelClass: targetModel,
      join: {
        from: `${collection.tableName}.${
          collection.fields.find(f => f.reference == rel.localField).columnName
        }`,
        to: `${targetSchema.tableName}.${
          targetSchema.fields.find(f => f.reference == rel.remoteField)
            .columnName
        }`,
      },
    };
  }

  model.relationMappings = relationMappings;
};
