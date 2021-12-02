import { DepGraph } from 'dependency-graph';
import { EventEmitter2 } from 'eventemitter2';
import { isEqual } from 'lodash';
import {
  DataType,
  DataTypes,
  Dialect,
  Model,
  ModelCtor,
  QueryTypes,
  Sequelize,
} from 'sequelize';
import { ILogger, Inject, Logger } from '../../../app/container';
import { Exception } from '../../../app/exceptions/exception';
import { getErrorMessage } from '../../../app/kernel';
import { FieldType, ISchema } from '../../schema';
import {
  IRelationManyToMany,
  RelationKind,
} from '../../schema/interface/relation.interface';
import { isNullable, isPrimary, isText } from '../../schema/util/is-primary';
import { IDatabase, IDatabaseLink } from '../interface';
import { IAssociation } from '../interface/association.interface';
import { toModelDefinition } from './converters/to-model-definition';
import { toStructure } from './converters/to-structure';

export class DatabaseLink implements IDatabaseLink {
  /**
   * Inner registry to track the schema associations and their synchronized structures
   */
  protected associations = new Map<string, IAssociation>();

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly eventBus: EventEmitter2,
    readonly connection: Sequelize,
    readonly database: IDatabase,
  ) {
    this.logger = this.logger.child({ scope: `Link:${this.getName()}` });
  }

  getName(): string {
    return this.database.name;
  }

  getModel<T = Record<string, unknown>>(
    reference: string,
  ): ModelCtor<Model<T, T>> {
    if (this.associations.has(reference)) {
      return this.connection.model(reference);
    }

    throw new Exception(
      `Model [${reference}] is not associated with the [${this.getName()}] database`,
    );
  }

  getSchema(reference: string): ISchema {
    if (this.associations.has(reference)) {
      return this.associations.get(reference).schema;
    }

    throw new Exception(
      `Schema [${reference}] is not associated with the [${this.getName()}] database`,
    );
  }

  getSchemas(): ISchema[] {
    return Array.from(this.associations.values()).map(r => r.schema);
  }

  async associate(schemas: ISchema[]): Promise<void> {
    for (const schema of schemas) {
      const key = schema.reference;
      const structure = toStructure(schema);

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
        this.associations.set(key, { schema, structure, inSync: false });
      }
    }

    await this.synchronize();
  }

  /**
   * Convert the schema into a model and register it on the connection.
   */
  protected addModel(schema: ISchema) {
    // Remove the model if already registered,
    // otherwise the ORM will throw because the model is already defined.
    if (this.connection.isDefined(schema.reference)) {
      this.connection.modelManager.removeModel(this.getModel(schema.reference));
    }

    const definition = toModelDefinition(
      schema,
      this.connection.getDialect() as Dialect,
    );

    const model = this.connection.define(
      definition.modelName,
      definition.attributes,
      definition.options,
    );

    // When the ORM can't find a primary field, it adds it's own "id"
    // we have to remove the ID field if it's not present by defualt.
    if (!schema.fields.some(f => isPrimary(f))) {
      if (!schema.fields.some(f => f.columnName === 'id')) {
        model.removeAttribute('id');
      }
    }
  }

  protected getCommitOrder(): string[] {
    const dialect = this.connection.getDialect() as Dialect;
    const schemas = this.getSchemas();
    const dependencies: DepGraph<void> = new DepGraph({
      circular: true,
    });

    schemas.forEach(s => dependencies.addNode(s.reference));

    for (const localSchema of schemas) {
      if (localSchema.relations) {
        const localModel = this.getModel(localSchema.reference);

        for (const relation of localSchema.relations) {
          const remoteModel = this.getModel(relation.target);
          const remoteSchema = this.getSchema(relation.target);

          const localField = localSchema.fields.find(
            f => f.reference == relation.localField,
          );
          const remoteField = remoteSchema.fields.find(
            f => f.reference == relation.remoteField,
          );

          if (dialect === 'mariadb' || dialect === 'mysql') {
            this.logger.info(
              'Checkin type correction between [%s] -> [%s]',
              localSchema.reference,
              relation.name,
            );

            if (isText(localField)) {
              localModel['tableAttributes'][localField.reference].type =
                DataTypes.STRING(255);

              this.logger.info(
                'Local patch on [%s][%s] ',
                localSchema.reference,
                localField.reference,
              );
            }

            if (isText(remoteField)) {
              remoteModel['tableAttributes'][remoteField.reference].type =
                DataTypes.STRING(255);

              this.logger.info(
                'Remote patch on [%s][%s] ',
                remoteSchema.reference,
                localField.reference,
              );
            }
          }

          // Check if the relation is already defined.
          if (Object.keys(localModel.associations).includes(relation.name)) {
            continue;
          }

          let localColumn: string;
          let remoteColumn: string;

          if (localField) {
            localColumn = localField.reference;
          } else {
            throw new Exception(
              `Relation [${localSchema.reference}][${relation.name}] has invalid local field [${relation.localField}]`,
            );
          }

          if (remoteField) {
            remoteColumn = remoteField.reference;
          } else {
            throw new Exception(
              `Relation [${localSchema.reference}][${relation.name}] has invalid remote field [${relation.remoteField}]`,
            );
          }

          const onDelete = isNullable(localField) ? 'SET NULL' : 'CASCADE';
          const onUpdate = onDelete;

          if (relation.kind === RelationKind.BELONGS_TO_ONE) {
            dependencies.addDependency(
              localSchema.reference,
              remoteSchema.reference,
            );

            localModel.belongsTo(remoteModel, {
              as: relation.name,
              foreignKey: localColumn,
              targetKey: remoteColumn,
              constraints: true,
              onDelete,
              onUpdate,
            });
          } else if (relation.kind === RelationKind.BELONGS_TO_MANY) {
            localModel.belongsToMany(remoteModel, {
              as: relation.name,
              through: (relation as unknown as IRelationManyToMany).through,
              foreignKey: localColumn,
              targetKey: remoteColumn,
              constraints: true,
              onDelete,
            });
          } else if (relation.kind === RelationKind.HAS_ONE) {
            localModel.hasOne(remoteModel, {
              as: relation.name,
              sourceKey: localColumn,
              foreignKey: remoteColumn,
              constraints: true,
              onDelete,
              onUpdate,
            });
          } else if (relation.kind === RelationKind.HAS_MANY) {
            localModel.hasMany(remoteModel, {
              as: relation.name,
              sourceKey: localColumn,
              foreignKey: remoteColumn,
              constraints: true,
              onDelete,
              onUpdate,
            });
          }
        }
      }
    }

    return dependencies.overallOrder(false);
  }

  /**
   * Synchronize the schemas with the database and the ORM.
   */
  protected async synchronize(): Promise<void> {
    // Reduce the associations to only the changed schemas.
    const changes: ISchema[] = Array.from(this.associations.values())
      .filter(association => !association.inSync)
      .map(association => association.schema);

    // Nothing has changed, skip early.
    if (!changes.length) {
      return;
    }

    const dialect = this.connection.getDialect() as Dialect;

    // Register the models on the ORM
    changes.forEach(this.addModel.bind(this));

    // Calculate the commit order based on relations and foreign keys.
    let order: string[];

    try {
      order = this.getCommitOrder();
    } catch (error) {
      this.logger.warn(getErrorMessage(error));
      this.logger.warn(
        'Schema relations are in an incomplete state, could not synchonize',
      );
      return;
    }

    const existingTables = await this.getTableList();

    for (const reference of order) {
      const schema = changes.find(s => s.reference === reference);

      // Imported / protected schemas are not synchronized.
      if (!schema || schema.tags.includes('readonly')) {
        continue;
      }
      this.logger.debug('Synchornizing [%s] schema', reference);

      const model = this.getModel(reference);

      // Postgres sync has an issue with enum types.
      // We simply change the type to string until the synchornization is finished
      // And then manually call the column chanage.
      const patches: EnumPatch[] = [];

      if (dialect === 'postgres') {
        for (const field of schema.fields) {
          if (field.type === FieldType.ENUM) {
            patches.push({
              reference: field.reference,
              columnName: field.columnName,
              type: model['tableAttributes'][field.reference].type,
            });

            model['tableAttributes'][field.reference].type = DataTypes.STRING;
          }
        }
      }

      if (dialect === 'sqlite') {
        await this.connection.query('PRAGMA ignore_check_constraints = 1');
        await this.connection.query('PRAGMA foreign_keys = 0');
      }

      const shouldAlter = existingTables.includes(schema.tableName);

      await model.sync({
        alter: shouldAlter,
        force: false,
      });

      if (dialect === 'sqlite') {
        await this.connection.query('PRAGMA ignore_check_constraints = 0');
        await this.connection.query('PRAGMA foreign_keys = 1');
      }

      for (const patch of patches) {
        const field = schema.fields.find(f => f.reference === patch.reference);

        model['tableAttributes'][patch.reference].type = patch.type;

        await this.connection
          .query(`Drop Type "enum_${model.tableName}_${patch.columnName}"`)
          .catch(e => {});

        await this.connection
          .getQueryInterface()
          .changeColumn(model.tableName, patch.columnName, {
            type: DataTypes.ENUM,
            allowNull: isNullable(field),
            values: field.typeParams.values,
          })
          .catch(e => this.logger.warn(getErrorMessage(e)));
      }

      this.associations.get(reference).inSync = true;
    }

    this.logger.info('Associations has been synchronized');
    this.eventBus.emit(`link.${this.database.name}.updated`, this);
  }

  close(): Promise<void> {
    return this.connection.close();
  }

  /**
   * Normalized table list, with this list we can decide if we use create table or alter table as sync time.
   */
  protected async getTableList(): Promise<string[]> {
    const tables = [];
    const dialect = this.connection.getDialect() as Dialect;

    if (dialect === 'postgres') {
      const rows = await this.connection.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = current_schema()`,
        {
          type: QueryTypes.SELECT,
        },
      );

      rows.forEach((r: { tablename: string }) => tables.push(r.tablename));
    } else if (dialect === 'mariadb' || dialect === 'mysql') {
      const rows = await this.connection.query(`Show TABLES`, {
        type: QueryTypes.SELECT,
      });

      rows.forEach(r => tables.push(Object.values(r)[0]));
    } else if (dialect === 'sqlite') {
      const rows = await this.connection.query(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY 1;`,
        {
          type: QueryTypes.SELECT,
        },
      );

      rows.forEach((r: { name: string }) => tables.push(r.name));
    }

    return tables;
  }
}

type EnumPatch = {
  reference: string;
  columnName: string;
  type: DataType;
};
