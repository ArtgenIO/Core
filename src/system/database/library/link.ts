import { startCase } from 'lodash';
import { Dialect, Model, ModelCtor, ModelType, Sequelize } from 'sequelize';
import { SequelizeAuto } from 'sequelize-auto';
import { FieldType, IField, ISchema } from '../../../content/schema';
import { IDatabase, ILink } from '../interface';
import { schemaToModel } from './schema-to-model';

export class Link implements ILink {
  protected schemas: ISchema[] = [];

  constructor(protected connection: Sequelize, readonly database: IDatabase) {}

  model<T = Record<string, unknown>>(schema: string): ModelCtor<Model<T, T>> {
    console.log('Resolving', schema, 'for', this.database.name);
    return this.connection.model(schema);
  }

  getSchemas(): ISchema[] {
    return this.schemas;
  }

  async manage(schemas: ISchema[]): Promise<void> {
    if (schemas.length) {
      // Remove current models
      for (const model of this.connection.modelManager.all) {
        this.connection.modelManager.removeModel(model as unknown as ModelType);
      }

      for (const schema of schemas) {
        const definition = schemaToModel(
          schema,
          this.connection.getDialect() as Dialect,
        );

        const model = this.connection.define(
          definition.modelName,
          definition.attributes,
          definition.options,
        );

        if (!schema.tags.includes('imported')) {
          // Startup with SQLite
          if (this.database.type === 'sqlite') {
            if (this.schemas.length === 0) {
              await model.sync({
                force: true,
              });
            } else {
            }
          } else {
            await model.sync({
              alter: true,
            });
          }
        }
      }
    }

    this.schemas = schemas;
  }

  async importExisting(): Promise<ISchema[]> {
    const newSchemas = [];

    const reader = new SequelizeAuto(this.connection, null, null, {
      directory: '',
      singularize: false,
      noWrite: true,
      noInitModels: true,
      noAlias: true,
      closeConnectionAutomatically: false,
    });
    const dbSchema = await reader.run();

    for (const table in dbSchema.tables) {
      if (Object.prototype.hasOwnProperty.call(dbSchema.tables, table)) {
        const definition = dbSchema.tables[table];
        let dbSchemaName: string;
        let dbTableName: string = table;

        // Posgres returns with the schema.table format.
        if (this.connection.getDialect() === 'postgres') {
          [dbSchemaName, dbTableName] = table.split('.');
        }

        const newSchema: ISchema = {
          label: startCase(dbTableName),
          reference: table,
          tableName: dbTableName,
          database: this.database.name,
          fields: [],
          icon: 'table_rows',
          permission: 'rw',
          uniques: [],
          indices: [],
          tags: ['imported'],
          version: 2,
        };

        for (const columnName in definition) {
          if (Object.prototype.hasOwnProperty.call(definition, columnName)) {
            const columnDef = definition[columnName];

            const newField: IField = {
              label: startCase(columnName),
              reference: columnName,
              columnName: columnName,
              type: FieldType.TEXT,
              defaultValue: columnDef.defaultValue,
              tags: [],
            };

            newSchema.fields.push(newField);
          }
        }

        // Skip if we alread have this.
        if (!this.schemas.find(s => s.tableName === newSchema.tableName)) {
          newSchemas.push(newSchema);
        }
      }
    }

    await this.manage([...this.schemas, ...newSchemas]);

    return newSchemas;
  }

  async close() {
    await this.connection.close();
  }
}
