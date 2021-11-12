import {
  DataType,
  DataTypes,
  Dialect,
  Model,
  ModelCtor,
  ModelType,
  Sequelize,
} from 'sequelize';
import { FieldType, ISchema } from '../../../content/schema';
import {
  IRelationManyToMany,
  RelationKind,
} from '../../../content/schema/interface/relation.interface';
import { isPrimary } from '../../../content/schema/util/is-primary';
import { getErrorMessage } from '../../kernel';
import { IDatabase, ILink } from '../interface';
import { schemaToModel } from './schema-to-model';

export class Link implements ILink {
  protected schemas: ISchema[] = [];

  constructor(readonly connection: Sequelize, readonly database: IDatabase) {}

  model<T = Record<string, unknown>>(schema: string): ModelCtor<Model<T, T>> {
    return this.connection.model(schema);
  }

  getSchemas(): ISchema[] {
    return this.schemas;
  }

  async setSchemas(schemas: ISchema[]): Promise<void> {
    if (schemas.length) {
      // Remove current models
      for (const model of this.connection.modelManager.all) {
        this.connection.modelManager.removeModel(model as unknown as ModelType);
      }

      // Define the models on the connection
      schemas.forEach(schema => {
        const definition = schemaToModel(
          schema,
          this.connection.getDialect() as Dialect,
        );

        const m = this.connection.define(
          definition.modelName,
          definition.attributes,
          definition.options,
        );

        // When the ORM can't find a primary field, then it adds it's own
        // we have to remove the ID field if it's not present by defualt.
        if (!schema.fields.some(f => isPrimary(f))) {
          if (!schema.fields.some(f => f.columnName === 'id')) {
            m.removeAttribute('id');
          }
        }
      });

      // Build relations
      for (const schema of schemas) {
        if (schema.relations) {
          const local = this.connection.models[schema.reference];

          for (const relation of schema.relations) {
            if (relation.kind === RelationKind.BELONGS_TO_ONE) {
              const remote = this.connection.models[relation.target];

              local.belongsTo(remote, {
                as: relation.name,
                foreignKey: relation.localField,
                targetKey: relation.remoteField,
                constraints: true,
                onDelete: 'CASCADE', // TODO: make options for those
                onUpdate: 'CASCADE', // dont want users to be deleted because their avatar is removed :D
              });
            }

            if (relation.kind === RelationKind.BELONGS_TO_MANY) {
              const remote = this.connection.models[relation.target];

              local.belongsToMany(remote, {
                as: relation.name,
                through: (relation as unknown as IRelationManyToMany).through,
                foreignKey: relation.localField,
                targetKey: relation.remoteField,
                constraints: true,
                onDelete: 'CASCADE',
              });
            }

            if (relation.kind === RelationKind.HAS_ONE) {
              const remote = this.connection.models[relation.target];

              local.hasOne(remote, {
                as: relation.name,
                foreignKey: relation.remoteField,
                sourceKey: relation.localField,
                constraints: true,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
              });
            }

            if (relation.kind === RelationKind.HAS_MANY) {
              const remote = this.connection.models[relation.target];

              local.hasMany(remote, {
                as: relation.name,
                sourceKey: relation.localField,
                foreignKey: relation.remoteField,
                constraints: true,
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
              });
            }
          }
        }
      }

      for (const schema of schemas) {
        let shouldSync: boolean = false;
        let syncForce: boolean = false;
        let syncAlter: boolean = false;

        // Never sync readonly schemas
        if (!schema.tags.includes('readonly')) {
          // SQLite has some behavior problem
          if (this.database.type === 'sqlite') {
            // Only sync when the schemas not imported yet.
            if (this.schemas.length === 0) {
              shouldSync = true;
              syncForce = true;
            }
          } else {
            // Other databases can be synced with the "safer" alter method.

            shouldSync = true;
            syncAlter = true;
          }
        }

        if (shouldSync) {
          const m = this.connection.models[schema.reference];
          // Postgres sync has an issue with enum types, so we will rename and drop it.
          const subjectEnums: {
            reference: string;
            columnName: string;
            originalType: DataType;
          }[] = [];

          if (this.database.type === 'postgres') {
            for (const f of schema.fields) {
              if (f.type === FieldType.ENUM) {
                subjectEnums.push({
                  reference: f.reference,
                  columnName: f.columnName,
                  originalType: m['tableAttributes'][f.reference].type,
                });

                // Make the system think this is a string type.
                m['tableAttributes'][f.reference].type = DataTypes.STRING;
              }
            }
          }

          await m.sync({
            alter: syncAlter,
            force: syncForce,
          });

          for (const r of subjectEnums) {
            m['tableAttributes'][r.reference].type = r.originalType;

            await this.connection
              .query(`Drop Type "enum_${m.tableName}_${r.columnName}"`)
              .catch(e => console.error(getErrorMessage(e)));

            await this.connection
              .getQueryInterface()
              .changeColumn(m.tableName, r.columnName, {
                type: DataTypes.ENUM,
                allowNull: false,
                values: schema.fields.find(f => f.reference === r.reference)
                  .typeParams.values,
              })
              .catch(e => console.error(getErrorMessage(e)));
          }
        }
      }
    }

    this.schemas = schemas;
  }

  async close() {
    await this.connection.close();
  }
}
