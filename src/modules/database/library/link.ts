import { DepGraph } from 'dependency-graph';
import { EventEmitter2 } from 'eventemitter2';
import {
  DataType,
  DataTypes,
  Dialect,
  Model,
  ModelCtor,
  ModelType,
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
import { isPrimary } from '../../schema/util/is-primary';
import { IDatabase, ILink } from '../interface';
import { schemaToModel } from './schema-to-model';

export class Link implements ILink {
  protected schemas: ISchema[] = [];

  constructor(
    @Logger()
    readonly logger: ILogger,
    @Inject(EventEmitter2)
    readonly events: EventEmitter2,
    readonly connection: Sequelize,
    readonly database: IDatabase,
  ) {}

  model<T = Record<string, unknown>>(schema: string): ModelCtor<Model<T, T>> {
    return this.connection.model(schema);
  }

  getSchemas(): ISchema[] {
    return this.schemas;
  }

  async addSchemas(newSchemas: ISchema[]): Promise<void> {
    const realNewSchemas = [];

    for (const newSchema of newSchemas) {
      if (!this.schemas.find(s => s.reference === newSchema.reference)) {
        realNewSchemas.push(newSchema);
      }
    }

    if (realNewSchemas.length) {
      await this.setSchemas([...this.schemas, ...realNewSchemas]);
    }
  }

  async setSchemas(schemas: ISchema[]): Promise<void> {
    const newSchemas = JSON.stringify(schemas);
    const oldSchemas = JSON.stringify(this.schemas);

    if (newSchemas != oldSchemas) {
      if (schemas.length) {
        const deps: DepGraph<void> = new DepGraph({
          circular: true,
        });

        // Remove current models
        for (const model of this.connection.modelManager.all) {
          this.connection.modelManager.removeModel(
            model as unknown as ModelType,
          );
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
          if (!deps.hasNode(schema.reference)) {
            deps.addNode(schema.reference);
          }

          if (schema.relations) {
            const local = this.connection.models[schema.reference];

            for (const relation of schema.relations) {
              const remote = this.connection.models[relation.target];
              const remoteSchema = schemas.find(
                s => s.reference === relation.target,
              );

              if (!remoteSchema) {
                throw new Exception(
                  `Relation [${relation.name}] between [${schema.reference}] -> [${relation.target}] could not be solved, the target relation does not exits.`,
                );
              }

              // Add the relation node
              if (!deps.hasNode(remoteSchema.reference)) {
                deps.addNode(remoteSchema.reference);
              }

              const localField = schema.fields.find(
                f => f.reference == relation.localField,
              );
              const remoteField = schemas
                .find(s => s.reference === relation.target)
                .fields.find(f => f.reference == relation.remoteField);

              let localColumn: string;
              let remoteColumn: string;

              if (localField) {
                localColumn = localField.reference;
              } else {
                throw new Exception(
                  `Relation [${schema.reference}][${relation.name}] has invalid local field [${relation.localField}]`,
                );
              }

              if (remoteField) {
                remoteColumn = remoteField.reference;
              } else {
                throw new Exception(
                  `Relation [${schema.reference}][${relation.name}] has invalid remote field [${relation.remoteField}]`,
                );
              }

              if (relation.kind === RelationKind.BELONGS_TO_ONE) {
                deps.addDependency(schema.reference, remoteSchema.reference);

                local.belongsTo(remote, {
                  as: relation.name,
                  foreignKey: localColumn,
                  targetKey: remoteColumn,
                  constraints: true,
                  onDelete: 'CASCADE', // TODO: make options for those
                  onUpdate: 'CASCADE', // dont want users to be deleted because their avatar is removed :D
                });
              }

              if (relation.kind === RelationKind.BELONGS_TO_MANY) {
                local.belongsToMany(remote, {
                  as: relation.name,
                  through: (relation as unknown as IRelationManyToMany).through,
                  foreignKey: localColumn,
                  targetKey: remoteColumn,
                  constraints: true,
                  onDelete: 'CASCADE',
                });
              }

              if (relation.kind === RelationKind.HAS_ONE) {
                local.hasOne(remote, {
                  as: relation.name,
                  foreignKey: remoteColumn,
                  sourceKey: localColumn,
                  constraints: true,
                  onDelete: 'CASCADE',
                  onUpdate: 'CASCADE',
                });
              }

              if (relation.kind === RelationKind.HAS_MANY) {
                local.hasMany(remote, {
                  as: relation.name,
                  sourceKey: localColumn,
                  foreignKey: remoteColumn,
                  constraints: true,
                  onDelete: 'CASCADE',
                  onUpdate: 'CASCADE',
                });
              }
            }
          }
        }

        for (const schemaRef of deps.overallOrder(false)) {
          const schema = schemas.find(s => s.reference === schemaRef);

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
                .catch(e => this.logger.warn(getErrorMessage(e)));

              await this.connection
                .getQueryInterface()
                .changeColumn(m.tableName, r.columnName, {
                  type: DataTypes.ENUM,
                  allowNull: false,
                  values: schema.fields.find(f => f.reference === r.reference)
                    .typeParams.values,
                })
                .catch(e => this.logger.warn(getErrorMessage(e)));
            }
          }
        }
      }
    }

    this.schemas = schemas;

    this.events.emit(`link.${this.database.name}.updated`, this);

    for (const schema of this.schemas) {
      this.logger.debug(
        'Schema [%s][%s] is ready',
        schema.database,
        schema.reference,
      );
    }

    this.logger.info(
      'Link [%s] schemas has been synchronized',
      this.database.name,
    );
  }

  async close() {
    await this.connection.close();
  }
}
