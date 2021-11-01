// /*
// import { startCase } from 'lodash';
// import { QueryTypes, Sequelize } from 'sequelize';
// import SequelizeAuto from 'sequelize-auto';
// import { ColumnDescription } from 'sequelize/types';
// import { Literal } from 'sequelize/types/lib/utils';
// import { WorkflowCollectionSchema } from '../../../management/workflow/collection/workflow.collection';
// import { ILogger, Inject, Logger, Service } from '../../../system/container';
// import { ICollectionMeta } from '../interface/collection-meta.interface';
// import { ICollection } from '../interface/collection.interface';
// import { IColumnMeta } from '../interface/column-meta.interface';
// import { IColumn } from '../interface/column.interface';
// import isJSON = require('is-json');
// import { Connection } from 'typeorm';

// @Service()
// export class CollectionService {
//   protected collections: Map<string, ICollection> = new Map();

//   constructor(
//     @Logger()
//     readonly logger: ILogger,
//     @Inject('providers.ConnectionProvider')
//     readonly connection: Connection,
//   ) {}

//   /**
//    * Get the list of collections
//    */
//   findAll() {
//     return this.collections.values();
//   }

//   /**
//    * Find a colelction by reference
//    */
//   findByReference(ref: string) {
//     return this.collections.has(ref) ? this.collections.get(ref) : null;
//   }

//   /**
//    * Read the database schema from the database
//    */
//   async readDatabaseSchema() {
//     const reader = this.createDatabaseReader();
//     const dbSchema = await reader.run();

//     // Seed the system?
//     await this.createOrmModel(WorkflowCollectionSchema, true);
//     return;

//     for (const table in dbSchema.tables) {
//       if (Object.prototype.hasOwnProperty.call(dbSchema.tables, table)) {
//         const meta = await this.readTableMeta(table);
//         const definition = dbSchema.tables[table];

//         const [dbSchemaName, dbTableName] = table.split('.');

//         const collection: ICollection = {
//           reference: meta.ref,
//           label: meta.lbl,
//           tags: meta.tags,
//           dbName: dbTableName,
//           dbSchemaName: dbSchemaName,
//           columns: [],
//         };

//         for (const columnName in definition) {
//           if (Object.prototype.hasOwnProperty.call(definition, columnName)) {
//             const columnDef = definition[columnName];
//             const columnMeta = await this.readColumnMeta(
//               table,
//               columnName,
//               columnDef,
//             );

//             const columnSchema: IColumn = {
//               reference: columnMeta.ref,
//               label: columnMeta.lbl,
//               dbName: columnName,
//               defaultValue: columnDef.defaultValue,
//               type: columnDef.type,
//               tags: columnMeta.tags,
//             };

//             collection.columns.push(columnSchema);
//           }
//         }

//         // Register on the connection
//         await this.createOrmModel(collection, false);
//       }
//     }
//   }

//   /**
//    * Read column meta. But also create in the database if not yet added.
//    */
//   protected async readColumnMeta(
//     table: string,
//     columnName: string,
//     descriptor: ColumnDescription,
//   ): Promise<IColumnMeta> {
//     if (!descriptor.comment || !isJSON(descriptor.comment)) {
//       const meta: IColumnMeta = {
//         ref: columnName,
//         lbl: startCase(columnName),
//         tags: [],
//       };

//       if (descriptor.primaryKey) {
//         meta.tags.push('primary');
//       }

//       if (descriptor.autoIncrement) {
//         meta.tags.push('ai');
//       }

//       if (descriptor.allowNull) {
//         meta.tags.push('nullable');
//       }

//       const [schemaName, tableName] = table.split('.');

//       await this.connection.query(
//         `COMMENT ON COLUMN "${schemaName}"."${tableName}"."${columnName}" IS '${JSON.stringify(
//           meta,
//         )}'`,
//       );

//       return meta;
//     } else {
//       return JSON.parse(descriptor.comment);
//     }
//   }

//   /**
//    * Read table meta. But also create it in the database if not yet added.
//    */
//   protected async readTableMeta(table: string): Promise<ICollectionMeta> {
//     const [schemaName, tableName] = table.split('.');

//     const comment: string = (
//       (
//         await this.connection.query(
//           `SELECT pg_catalog.obj_description(pgc.oid, 'pg_class') AS comment
//       FROM information_schema.tables t
//       INNER JOIN pg_catalog.pg_class pgc
//       ON t.table_name = pgc.relname
//       WHERE t.table_type='BASE TABLE' AND t.table_schema = $1 AND t.table_name = $2`,
//           {
//             type: QueryTypes.SELECT,
//             bind: [schemaName, tableName],
//           },
//         )
//       )[0] as { comment: string }
//     ).comment;

//     // Missing meta, or real comment
//     if (!comment || !isJSON(comment)) {
//       const meta: ICollectionMeta = {
//         ref: tableName,
//         lbl: startCase(tableName),
//         tags: ['active'],
//       };

//       // Update the comment
//       await this.connection.query(
//         `COMMENT ON TABLE "${schemaName}"."${tableName}" IS '${JSON.stringify(
//           meta,
//         )}'`,
//       );

//       return meta;
//     } else {
//       return JSON.parse(comment) as ICollectionMeta;
//     }
//   }

//   /**
//    * Client which can read schemas from the database
//    */
//   protected createDatabaseReader(): SequelizeAuto {
//     return new SequelizeAuto(this.connection, null, null, {
//       directory: '',
//       singularize: false,
//       noWrite: true,
//       noInitModels: true,
//       noAlias: true,
//       closeConnectionAutomatically: false,
//     });
//   }

//   /**
//    * Create the database table from a schema definition
//    */
//   async createOrmModel(col: ICollection, sync: boolean) {
//     const columns: { [name: string]: ColumnDescription } = {};

//     for (const column of col.columns) {
//       // Local mapped name
//       const columnName = column.reference;
//       let defaultValue: string | Literal = column.tags.includes('nullable')
//         ? null
//         : '';

//       if (column.defaultValue) {
//         defaultValue = column.defaultValue.toString();

//         console.log('INCLUDES?', defaultValue.substr(0, 3));

//         if (defaultValue.substr(0, 3) === '::=') {
//           defaultValue = Sequelize.literal(defaultValue.substring(3));
//         }

//         if (column.type === 'json' && isJSON(defaultValue)) {
//           defaultValue = JSON.parse(defaultValue as string);
//         }
//       }

//       console.log('defaultValue', column.defaultValue, defaultValue);

//       const columnDefinition: ColumnDescription = {
//         type: column.type,
//         defaultValue: defaultValue as any,
//         primaryKey: column.tags.includes('primary'),
//         autoIncrement: column.tags.includes('ai'),
//         allowNull: column.tags.includes('nullable'),
//         comment: this.createColumnMetaComment(column),
//       };

//       columns[columnName] = columnDefinition;
//     }

//     console.info('Collection def', columns);

//     const isExists = this.connection.isDefined(col.reference);

//     const Model = this.connection.define(col.reference, columns, {
//       modelName: col.reference,
//       tableName: col.dbName,
//       schema: col.dbSchemaName,
//       freezeTableName: true,
//       createdAt: false,
//       updatedAt: false,
//       version: false,
//       comment: this.createTableMetaComment(col),
//     });

//     // Create the model in the database
//     if (sync) {
//       // Just alter
//       if (isExists) {
//         await Model.sync({ alter: true });
//       } else {
//         // Create the whole
//         await Model.sync({});
//       }
//     }

//     // Register in the index
//     this.collections.set(col.reference, col);

//     this.logger.info('Collection [%s] model registered', col.reference);

//     return Model;
//   }

//   async updateCollection(collection: ICollection) {
//     return this.createOrmModel(collection, true);
//   }

//   /**
//    * Generate table comment from a definition
//    */
//   createTableMetaComment(schema: ICollection): string {
//     return JSON.stringify({
//       ref: schema.reference,
//       lbl: schema.label,
//       tags: schema.tags,
//     } as ICollectionMeta);
//   }

//   /**
//    * Create column comment from a defintion
//    */
//   createColumnMetaComment(column: IColumn): string {
//     return JSON.stringify({
//       ref: column.reference,
//       lbl: column.label,
//       tags: column.tags,
//     } as IColumnMeta);
//   }
// }
