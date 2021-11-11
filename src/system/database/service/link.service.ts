import { startCase } from 'lodash';
import { Sequelize } from 'sequelize';
import SequelizeAuto from 'sequelize-auto';
import { FieldTag, FieldType, IField, ISchema } from '../../../content/schema';
import { getFieldTypeFromString } from '../../../content/schema/util/field-mapper';
import { ILogger, Inject, Logger, Service } from '../../container';
import { ILink } from '../interface';
import { IDatabase } from '../interface/database.interface';
import { DatabaseConnectionFactory } from '../library/database-connection.factory';
import { Link } from '../library/link';

/**
 * Responsible to create links to databases, currently only supports the ORM connections,
 * but later this will be the service managing the excel, and API like connections too.
 *
 * Just a self note, investigate this awesome looking library: https://www.js-data.io/
 * I like their way to solve the data management, maybe we can make use of it when
 * the database migrations are managed with a self adjusted library.
 */
@Service()
export class LinkService {
  /**
   * In memory registry for links, mapped to the database name.
   */
  protected registry = new Map<string, Link>();

  constructor(
    @Logger()
    protected logger: ILogger,
    @Inject(DatabaseConnectionFactory)
    readonly connectionFactory: DatabaseConnectionFactory,
  ) {}

  /**
   * Create a connection to the given database.
   */
  async create(database: IDatabase, schemas: ISchema[]): Promise<Link> {
    this.logger.debug('Connection [%s] creating', database.name);

    const connection: Sequelize = this.connectionFactory.create(database);

    try {
      await connection.validate();

      this.logger.info('Connection [%s] has connected', database.name);
    } catch (error) {
      this.logger.error(
        'Connection to the [%s] database has failed',
        database.name,
      );

      throw error;
    }

    const link = new Link(connection, database);
    await link.setSchemas(schemas);

    this.registry.set(database.name, link);

    return link;
  }

  findByName(name: string): Link {
    return this.registry.get(name);
  }

  findAll(): Link[] {
    return Array.from(this.registry.values());
  }

  /**
   * Discover and import the schemas to an existing link.
   */
  async discover(link: ILink): Promise<ISchema[]> {
    const newSchemas = [];

    const reader = new SequelizeAuto(link.connection, null, null, {
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
        if (link.connection.getDialect() === 'postgres') {
          [dbSchemaName, dbTableName] = table.split('.');
        }

        const newSchema: ISchema = {
          label: startCase(dbTableName),
          reference: dbTableName,
          tableName: dbTableName,
          database: link.database.name,
          fields: [],
          icon: 'table_rows',
          permission: 'rw',
          uniques: [],
          indices: [],
          tags: ['readonly'],
          relations: [],
          version: 2,
          artboard: {
            position: {
              x: 0,
              y: 0,
            },
          },
        };

        for (const columnName in definition) {
          if (Object.prototype.hasOwnProperty.call(definition, columnName)) {
            const columnDef = definition[columnName];
            const type = getFieldTypeFromString(
              columnDef.type,
              (columnDef as unknown as { special: string[] }).special,
            );

            const newField: IField = {
              label: startCase(columnName),
              reference: columnName,
              columnName: columnName,
              type: type.type,
              typeParams: type.params,
              defaultValue: columnDef.defaultValue,
              tags: [],
            };

            // Primary generated field
            if (newField.type === FieldType.UUID) {
              if (columnDef.defaultValue === 'uuid_generate_v4()') {
                newField.tags.push(FieldTag.PRIMARY);
              }
            }

            newSchema.fields.push(newField);
          }
        }

        // Skip if we alread have this.
        if (!link.getSchemas().find(s => s.tableName === newSchema.tableName)) {
          newSchemas.push(newSchema);
        }
      }
    }

    await link.setSchemas([...link.getSchemas(), ...newSchemas]);

    return newSchemas;
  }
}
