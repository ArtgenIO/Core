import { ILogger, Inject, Logger } from '@hisorange/kernel';
import { Binding } from '@loopback/context';
import { randomUUID } from 'crypto';
import { default as KNEX } from 'knex';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import {
  Model,
  ModelClass,
  Pojo,
  RelationMappings,
  RelationThrough,
  RelationType as ObjectionRelationType,
} from 'objection';
import { IDatabase } from '../../models/database.interface';
import { ISchema } from '../../models/schema.interface';
import { BaseException } from '../exceptions/base.exception';
import { FieldTool } from '../library/field-tools';
import { toStructure } from '../library/to-structure';
import { IConnectionAssociation } from '../types/connection-association.interface';
import { IDatabaseConnection } from '../types/database-connection.interface';
import { Dialect } from '../types/dialect.type';
import { FieldTag } from '../types/field-tags.enum';
import { FieldType } from '../types/field-type.enum';
import { RelationType } from '../types/relation.interface';
import { ITableStructure } from '../types/table-structure.interface';
import { ITransform } from '../types/transform.interface';
import { ITransformer } from '../types/transformer.interface';
import { DatabaseSynchronizer } from './synchronizer';

export class DatabaseConnection implements IDatabaseConnection {
  /**
   * Inner registry to track the schema associations and their synchronized structures
   */
  readonly associations = new Map<string, IConnectionAssociation>();
  readonly synchornizer: DatabaseSynchronizer;

  /**
   * Hash map for quick lookups, maps the transformers to their references.
   */
  protected transformerMap = new Map<string, ITransformer>();

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject((binding: Readonly<Binding<unknown>>) =>
      binding.tagNames.includes('transformer'),
    )
    readonly transformers: ITransformer[],
    readonly knex: ReturnType<typeof KNEX>,
    readonly database: IDatabase,
    readonly dialect: Dialect,
  ) {
    this.logger = this.logger.child({
      scope: `Connection:${this.database.ref}`,
    });

    this.synchornizer = new DatabaseSynchronizer(
      this.logger.child({ scope: `Synchronizer:${this.database.ref}` }),
      this,
    );

    this.transformers.forEach(t => this.transformerMap.set(t.reference, t));
  }

  getModel<T extends Model = Model>(reference: string): ModelClass<T> {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).model as ModelClass<T>;
    }

    throw new BaseException(
      `Model [${reference}] is not associated with the [${this.database.ref}] database`,
    );
  }

  getSchema(reference: string): ISchema {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).schema;
    }

    throw new BaseException(
      `Schema [${reference}] is not associated with the [${this.database.ref}] database`,
    );
  }

  getSchemas(): ISchema[] {
    return Array.from(this.associations.values()).map(r => r.schema);
  }

  async associate(schemas: ISchema[]): Promise<number> {
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

        const model = this.toModel(schema);
        model.knex(this.knex);

        // Update the schema ref
        association.schema = schema;
        association.model = model;

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
        const model = this.toModel(schema);
        model.knex(this.knex);

        this.associations.set(key, { schema, structure, inSync: false, model });
        this.logger.info('Schema [%s] registered', schema.reference);
      }
    }

    // Map relations after the models are defined
    // With this we have no problem with circular dependencies.
    for (const schema of schemas) {
      this.mapRelations(this.getModel(schema.reference), schema);
    }

    return await this.synchornizer.sync();
  }

  async deassociate(schemas: ISchema[]): Promise<void> {
    for (const schema of schemas) {
      if (!schema.tags.includes('readonly')) {
        this.logger.warn(
          'Schema has been deleted [%s], removing table if exists [%s]',
          schema.reference,
          schema.tableName,
        );

        await this.knex.schema.dropTableIfExists(schema.tableName);
      }

      if (this.associations.has(schema.reference)) {
        this.associations.delete(schema.reference);
      }
    }
  }

  /**
   * Each dialect has some unique behavior problems,
   * we adjust those problems before conversions.
   */
  toDialectSchema(schema: ISchema): ISchema {
    // SQLite patches
    if (this.dialect === 'sqlite') {
      // We only have 5 basic type, so we gona pre cast them
      for (const f of schema.fields) {
        switch (f.type) {
          // Text
          case FieldType.UUID:
            f.type = FieldType.CHAR;
            f.args.length = 36;
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
          if (!f.args?.length) {
            f.args.length = 255;
          }
        }

        // Only tinytext is supported, medium and long is converted into text
        if (f.type == FieldType.TEXT) {
          if (f.args?.length) {
            if (typeof f.args?.length == 'string') {
              if (f.args.length == 'medium' || f.args.length == 'long') {
                delete f.args.length;
              }
            } else {
              // Numeric text length is not supported just on char or vchar
              delete f.args.length;
            }
          }
        }

        // Unsigned is ignored
        if (f.args?.unsigned) {
          delete f.args.unsigned;
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
          if (!f.args?.length) {
            f.args.length = 255;
          }
        }

        // Blob marked as binary.
        if (f.type == FieldType.BLOB) {
          f.args.binary = true;
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

          f.args.scale = f.args?.scale ?? 0;

          if (!f.args?.precision) {
            switch (f.type) {
              case FieldType.INTEGER:
                f.args.precision = 32;
                break;

              case FieldType.BIGINT:
                f.args.precision = 64;
                break;
                break;
              case FieldType.SMALLINT:
                f.args.precision = 16;
                break;
            }
          }

          // Postgres does not have unsigned int, will have serial for this
          if (f.args?.unsigned) {
            delete f.args.unsigned;
          }
        }

        // Text is unlimited in postgres
        if (f.type == FieldType.TEXT) {
          if (f.args?.length) {
            delete f.args?.length;
          }
        }
      }
    }

    return schema;
  }

  toStructure(schema: ISchema): ITableStructure {
    return toStructure(schema);
  }

  protected toModel(schema: ISchema): ModelClass<Model> {
    // Map database columns to code level references
    // Database -> Model = Getter
    const toProperty = (s: ISchema) => {
      const columnMap = new Map<string, string>(
        s.fields.map(f => [f.columnName, f.reference]),
      );
      const getterMap = new Map<string, ITransform[]>();

      for (const f of s.fields) {
        if (f?.getters && f.getters?.length) {
          for (const getter of f.getters.sort((a, b) =>
            a.priority > b.priority ? 1 : -1,
          )) {
            if (!getterMap.has(f.reference)) {
              getterMap.set(f.reference, []);
            }

            getterMap
              .get(f.reference)
              .push(
                this.transformerMap
                  .get(getter.reference)
                  .from.bind(this.transformerMap.get(getter.reference)),
              );
          }
        }
      }

      return (database: Pojo): Pojo => {
        const code = {};

        for (const columnName in database) {
          if (Object.prototype.hasOwnProperty.call(database, columnName)) {
            if (columnMap.has(columnName)) {
              const referenceName = columnMap.get(columnName);
              code[referenceName] = database[columnName];

              // Apply get transformations
              if (getterMap.has(referenceName)) {
                getterMap
                  .get(referenceName)
                  .forEach(
                    getter =>
                      (code[referenceName] = getter(code[referenceName])),
                  );
              }
            }
          }
        }

        return code;
      };
    };

    // Map code level references to database columns
    // Database -> Model = Setter
    const toColumn = (s: ISchema) => {
      const referenceMap = new Map<string, string>(
        s.fields.map(f => [f.reference, f.columnName]),
      );
      const setterMap = new Map<string, ITransform[]>();

      for (const f of s.fields) {
        if (f?.setters && f.setters?.length) {
          for (const setter of f.setters.sort((a, b) =>
            a.priority > b.priority ? 1 : -1,
          )) {
            if (!setterMap.has(f.reference)) {
              setterMap.set(f.reference, []);
            }

            setterMap
              .get(f.reference)
              .push(
                this.transformerMap
                  .get(setter.reference)
                  .to.bind(this.transformerMap.get(setter.reference)),
              );
          }
        }
      }

      return (code: Pojo): Pojo => {
        const database = {};

        for (const referenceName in code) {
          if (Object.prototype.hasOwnProperty.call(code, referenceName)) {
            if (referenceMap.has(referenceName)) {
              const k = referenceMap.get(referenceName);
              database[k] = code[referenceName];

              // Apply set transformations
              if (setterMap.has(referenceName)) {
                setterMap
                  .get(referenceName)
                  .forEach(setter => (database[k] = setter(database[k])));
              }
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

        // if (updatedAt) {
        //   this[updatedAt.reference] = new Date()
        //     .toISOString()
        //     .replace(/T|Z/g, ' ');
        // }

        if (hasUUIDPK) {
          if (!this[primaryKeys[0].reference]) {
            this[primaryKeys[0].reference] = randomUUID();
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
      let type: ObjectionRelationType;
      let through: RelationThrough<any> = undefined;

      switch (rel.kind) {
        case RelationType.BELONGS_TO_ONE:
          type = Model.BelongsToOneRelation;
          break;
        case RelationType.HAS_ONE:
          type = Model.HasOneRelation;
          break;
        case RelationType.HAS_MANY:
          type = Model.HasManyRelation;
          break;
        case RelationType.BELONGS_TO_MANY:
          type = Model.ManyToManyRelation;
          const throughModel = this.getModel(rel.through);
          const throughSchema = this.getSchema(rel.through);

          // Define cross connection
          through = {
            from: `${throughSchema.tableName}.${
              throughSchema.fields.find(
                FieldTool.fReference(rel.throughLocalField),
              ).columnName
            }`,
            to: `${throughSchema.tableName}.${
              throughSchema.fields.find(
                FieldTool.fReference(rel.throughRemoteField),
              ).columnName
            }`,
            modelClass: throughModel,
          };
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
          through,
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
