import { EventEmitter2 } from 'eventemitter2';
import { Knex } from 'knex';
import { cloneDeep, isEqual } from 'lodash';
import {
  Model,
  ModelClass,
  Pojo,
  RelationMappings,
  RelationType,
} from 'objection';
import { v4 } from 'uuid';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { RelationKind } from '../../schema/interface/relation.interface';
import { FieldTool } from '../../schema/util/field-tools';
import { IDatabase, IDatabaseConnection, ITableStructure } from '../interface';
import { IConnectionAssociation } from '../interface/connection-association.interface';
import { Dialect } from '../interface/dialect.type';
import { DatabaseSynchronizer } from './database.synchronizer';

export class DatabaseConnection implements IDatabaseConnection {
  /**
   * Inner registry to track the schema associations and their synchronized structures
   */
  readonly associations = new Map<string, IConnectionAssociation>();
  readonly synchornizer: DatabaseSynchronizer;

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly eventBus: EventEmitter2,
    readonly knex: Knex,
    readonly database: IDatabase,
    readonly dialect: Dialect,
  ) {
    this.logger = this.logger.child({
      scope: `Connection:${this.database.name}`,
    });

    this.synchornizer = new DatabaseSynchronizer(
      this.logger.child({ scope: `Synchronizer:${this.database.name}` }),
      this,
    );
  }

  getModel<T extends Model = Model>(reference: string): ModelClass<T> {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).model as ModelClass<T>;
    }

    throw new Exception(
      `Model [${reference}] is not associated with the [${this.database.name}] database`,
    );
  }

  getSchema(reference: string): ISchema {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).schema;
    }

    throw new Exception(
      `Schema [${reference}] is not associated with the [${this.database.name}] database`,
    );
  }

  getSchemas(): ISchema[] {
    return Array.from(this.associations.values()).map(r => r.schema);
  }

  async associate(schemas: ISchema[]): Promise<IDatabaseConnection> {
    for (const schema of schemas) {
      const key = schema.reference;

      // We clone the original objects to not to interfere with other system calls,
      // and apply the dialect specific patches on those, so the other conversions
      // will already work with given dialect's patches.
      const dialected = this.toDialectSchema(cloneDeep(schema));
      const structure = this.toStructure(dialected);

      // Check if the schema is already associated with the registry.
      if (this.associations.has(key)) {
        const association = this.associations.get(key);

        // Update the schema ref
        association.schema = schema;

        // Check if the structure has changed.
        if (!isEqual(association.structure, structure)) {
          this.logger.info(
            'Schema [%s] structure has changed',
            schema.reference,
          );

          association.structure = structure;
          association.inSync = false;
        }
      } else {
        const model = this.toModel(schema).bindKnex(this.knex);

        this.associations.set(key, { schema, structure, inSync: false, model });
        this.logger.info('Schema [%s] registered', schema.reference);
      }
    }

    // Map relations after the models are defined
    // With this we have no problem with circular dependencies.
    for (const schema of schemas) {
      this.mapRelations(this.getModel(schema.reference), schema);
    }

    await this.synchornizer.sync();

    return this;
  }

  /**
   * Each dialect has some unique behavior problems,
   * we adjust those problems before conversions.
   */
  toDialectSchema(schema: ISchema): ISchema {
    const isMySQL = this.dialect == 'mysql' || this.dialect == 'mariadb';

    for (const field of schema.fields) {
      const isIndexed =
        FieldTool.isIndexed(field) ||
        schema.uniques.some(u => u.fields.includes(field.reference)) ||
        schema.relations.some(
          r =>
            (r.kind == RelationKind.BELONGS_TO_MANY ||
              r.kind == RelationKind.BELONGS_TO_ONE) &&
            r.localField == field.reference,
        );

      if (isMySQL) {
        // Longest value in the enum is responded as the length of the enum.
        if (field.type === FieldType.JSON) {
          if (field.typeParams?.length) {
            delete field.typeParams.length;
          }
        }

        // Text and blob fields can only hold indexes with specific prefix length
        // we cannot ensure the length of the field, so cutting it to a simple VARCHAR(255)
        // Not the perfect fix, but usually text is not indexed unless it's kinda short.
        if (isIndexed) {
          if (FieldTool.isText(field)) {
            if (!field.typeParams?.length) {
              field.type = FieldType.STRING;
              field.typeParams.length = 255;
            }
          }
        }

        // MySQL will return with the default 65535 if nothing is set
        // With this we can avoid the collision on schema reversal.
        if (field.type == FieldType.TEXT) {
          if (!field.typeParams?.length) {
            field.typeParams.length = 65535;
          }
        }

        // MySQL uses TINY, MEDIUM, and LONG text types.
        if (field.type == FieldType.TEXT) {
          if (typeof field.typeParams?.length == 'number') {
            // We convert the TEXT into VARCHAR so it can have a length.
            // 65535 is actualy the "normal" text length.
            if (field.typeParams.length !== 65535) {
              field.type = FieldType.STRING;
            } else {
              delete field.typeParams.length;
            }
          }
        }

        // MariaDB responds with LONGTEXT for JSON fields, but the length is meaningless.
        if (field.type == FieldType.JSON) {
          if (field.typeParams?.length) {
            delete field.typeParams.length;
          }
        }

        // VARCHAR maximum 16383 by default, we assume an utf8_mb4 here for safety
        // I do not expect too much situation where the user has a varchar over this size,
        // text is much more fitting for this kind of load.
        // But we can improve on this by getting a collation for the column.
        if (field.type === FieldType.STRING) {
          if (typeof field.typeParams?.length == 'number') {
            field.typeParams.length = Math.min(field.typeParams.length, 4095);
          }
        }

        // CHAR maximum is 255
        if (field.type === FieldType.CHAR) {
          if (typeof field.typeParams?.length == 'number') {
            field.typeParams.length = Math.min(field.typeParams.length, 255);
          }
        }

        // Following types cannot have default value in MySQL
        if (
          [
            FieldType.BLOB,
            FieldType.TEXT,
            FieldType.JSON,
            FieldType.JSONB,
          ].includes(field.type) &&
          typeof field.defaultValue !== 'undefined'
        ) {
          delete field.defaultValue;
        }
      }
    }

    // SQLite patches
    if (this.dialect === 'sqlite') {
      // We only have 5 basic type, so we gona pre cast them
      for (const f of schema.fields) {
        switch (f.type) {
          // Text
          case FieldType.UUID:
            f.type = FieldType.CHAR;
            f.typeParams.length = 36;
            break;
          case FieldType.CIDR:
          case FieldType.INET:
          case FieldType.MACADDR:
            f.type = FieldType.TEXT;
            break;
          // JSON
          case FieldType.JSON:
          case FieldType.JSONB:
          case FieldType.HSTORE:
            f.type = FieldType.JSON;
            break;
          // Real
          case FieldType.DECIMAL:
            f.type = FieldType.REAL;
            break;
        }

        // Char | VChar gets a default 255 length
        if (f.type == FieldType.CHAR || f.type == FieldType.STRING) {
          if (!f.typeParams?.length) {
            f.typeParams.length = 255;
          }
        }

        // Only tinytext is supported, medium and long is converted into text
        if (f.type == FieldType.TEXT) {
          if (f.typeParams?.length) {
            if (typeof f.typeParams?.length == 'string') {
              if (
                f.typeParams.length == 'medium' ||
                f.typeParams.length == 'long'
              ) {
                delete f.typeParams.length;
              }
            } else {
              // Numeric text length is not supported just on char or vchar
              delete f.typeParams.length;
            }
          }
        }

        // Unsigned is ignored
        if (f.typeParams?.unsigned) {
          delete f.typeParams.unsigned;
        }
      }
    }

    // MariaDB / MySQL patches
    if (isMySQL) {
      for (const f of schema.fields) {
        // Char | VChar gets a default 255 length
        if (f.type == FieldType.CHAR || f.type == FieldType.STRING) {
          if (!f.typeParams?.length) {
            f.typeParams.length = 255;
          }
        }

        // Blob defaults to 65535
        if (f.type == FieldType.BLOB) {
          if (!f.typeParams?.length) {
            f.typeParams.length = 65535;
          }
        }

        // Integers gets a default scale and precision
        if (FieldTool.isInteger(f)) {
          if (!f.typeParams?.scale) {
            f.typeParams.scale = 0;
          }

          if (!f.typeParams?.precision) {
            if (f.typeParams?.unsigned) {
              switch (f.type) {
                case FieldType.BIGINT:
                  f.typeParams.precision = 20;
                  break;
                case FieldType.INTEGER:
                  f.typeParams.precision = 10;
                  break;
                case FieldType.MEDIUMINT:
                  f.typeParams.precision = this.dialect === 'mariadb' ? 8 : 7;
                  break;
                case FieldType.SMALLINT:
                  f.typeParams.precision = 5;
                  break;
                case FieldType.TINYINT:
                  f.typeParams.precision = 3;
                  break;
              }
            } else {
              switch (f.type) {
                case FieldType.BIGINT:
                  f.typeParams.precision = 19;
                  break;
                case FieldType.INTEGER:
                  f.typeParams.precision = 10;
                  break;
                case FieldType.MEDIUMINT:
                  f.typeParams.precision = 7;
                  break;
                case FieldType.SMALLINT:
                  f.typeParams.precision = 5;
                  break;
                case FieldType.TINYINT:
                  f.typeParams.precision = 3;
                  break;
              }
            }
          }
        }
      }
    }

    // Postgres patches
    if (this.dialect === 'postgres') {
      for (const f of schema.fields) {
        // Char | VChar | Blob gets a default 255 length
        if (
          f.type == FieldType.CHAR ||
          f.type == FieldType.STRING ||
          f.type == FieldType.BLOB
        ) {
          if (!f.typeParams?.length) {
            f.typeParams.length = 255;
          }
        }

        // Blob marked as binary.
        if (f.type == FieldType.BLOB) {
          f.typeParams.binary = true;
        }

        // Integers gets a default scale and precision
        if (FieldTool.isInteger(f)) {
          if (f.type == FieldType.MEDIUMINT) {
            f.type = FieldType.INTEGER;
          }

          // TinyInt is not present, uses smallint in place
          if (f.type == FieldType.TINYINT) {
            f.type = FieldType.SMALLINT;
          }

          f.typeParams.scale = f.typeParams?.scale ?? 0;

          if (!f.typeParams?.precision) {
            switch (f.type) {
              case FieldType.INTEGER:
                f.typeParams.precision = 32;
                break;

              case FieldType.BIGINT:
                f.typeParams.precision = 64;
                break;
                break;
              case FieldType.SMALLINT:
                f.typeParams.precision = 16;
                break;
            }
          }

          // Postgres does not have unsigned int, will have serial for this
          if (f.typeParams?.unsigned) {
            delete f.typeParams.unsigned;
          }
        }

        // Text is unlimited in postgres
        if (f.type == FieldType.TEXT) {
          if (f.typeParams?.length) {
            delete f.typeParams?.length;
          }
        }
      }
    }

    return schema;
  }

  toStructure(schema: ISchema): ITableStructure {
    const sortByName = (a: { name: string }, b: { name: string }) =>
      a.name > b.name ? 1 : -1;
    const sortByValue = (a: string, b: string) => (a > b ? 1 : -1);

    // Ensure no spaces are messing up the table name.
    const tableName = schema.tableName.trim();
    // Sort the relations by name.
    const relations = Array.from(schema.relations)
      .sort(sortByName)
      .filter(
        r =>
          r.kind === RelationKind.BELONGS_TO_ONE ||
          r.kind === RelationKind.BELONGS_TO_MANY,
      )
      .map(r => ({
        target: r.target,
        localField: r.localField,
        remoteField: r.remoteField,
      }));
    // Sort the uniques
    const uniques = Array.from(schema.uniques)
      .sort(sortByName)
      .map(unq => ({
        fields: unq.fields.sort(sortByValue),
      }));
    // Sort the indices
    const indices = Array.from(schema.indices).sort(sortByName);

    // Strip fields
    const fields = Array.from(schema.fields)
      .sort((a, b) => (a.columnName > b.columnName ? 1 : -1))
      .map(f => ({
        columnName: f.columnName,
        type: f.type === FieldType.JSONB ? FieldType.JSON : f.type,
        typeParams: f.typeParams,
      }));

    for (const f of fields) {
      if (f.typeParams.values?.length) {
        f.typeParams.values = f.typeParams.values
          .map(v => v.toString())
          .sort((a, b) => (a > b ? 1 : -1));
      }
    }

    return { tableName, relations, uniques, indices, columns: fields };
  }

  protected toModel(schema: ISchema): ModelClass<Model> {
    // Map database columns to code level references
    const toProperty = (s: ISchema) => {
      const columnMap = new Map<string, string>(
        s.fields.map(f => [f.columnName, f.reference]),
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
    const toColumn = (s: ISchema) => {
      const referenceMap = new Map<string, string>(
        s.fields.map(f => [f.reference, f.columnName]),
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
    const onCreate = (s: ISchema) => {
      const primaryKeys = s.fields.filter(FieldTool.isPrimary);
      const hasUUIDPK =
        primaryKeys.length === 1 && primaryKeys[0].type === FieldType.UUID;
      const createdAt = s.fields.find(f => f.tags.includes(FieldTag.CREATED));
      const versioned = s.fields.find(f => f.tags.includes(FieldTag.VERSION));
      const defaults = s.fields.filter(
        f => typeof f.defaultValue !== 'undefined',
      );

      return function () {
        const defined = Object.keys(this);

        for (const defField of defaults) {
          if (!defined.includes(defField.reference)) {
            this[defField.reference] = defField.defaultValue;
          }
        }

        if (createdAt) {
          this[createdAt.reference] = new Date()
            .toISOString()
            .replace(/T|Z/g, ' ');
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
    const onUpdate = (s: ISchema) => {
      const updatedAt = s.fields.find(f => f.tags.includes(FieldTag.UPDATED));
      const versioned = s.fields.find(f => f.tags.includes(FieldTag.VERSION));

      return function () {
        if (updatedAt) {
          this[updatedAt.reference] = new Date()
            .toISOString()
            .replace(/T|Z/g, ' ');
        }

        if (versioned) {
          this[versioned.reference] = (this[versioned.reference] ?? 0) + 1;
        }
      };
    };

    const model = class extends Model {};

    model.tableName = schema.tableName;
    model.idColumn = schema.fields
      .filter(FieldTool.isPrimary)
      .map(f => f.reference);

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
  }

  protected mapRelations(model: ModelClass<Model>, collection: ISchema): void {
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

      const targetModel = this.getModel(rel.target);
      const targetSchema = this.getSchema(rel.target);

      relationMappings[rel.name] = {
        relation: type,
        modelClass: targetModel,
        join: {
          from: `${collection.tableName}.${
            collection.fields.find(f => f.reference == rel.localField)
              .columnName
          }`,
          to: `${targetSchema.tableName}.${
            targetSchema.fields.find(f => f.reference == rel.remoteField)
              .columnName
          }`,
        },
      };
    }

    model.relationMappings = relationMappings;
  }

  close(): Promise<void> {
    this.logger.info('Closing the connection pool');

    return this.knex.destroy();
  }
}
