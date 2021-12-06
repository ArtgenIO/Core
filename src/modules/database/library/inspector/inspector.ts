import { Knex } from 'knex';
import MySQLKnexInspector from 'knex-schema-inspector/dist/dialects/mysql';
import PostgreSQLKnexInspector from 'knex-schema-inspector/dist/dialects/postgres';
import SQLiteKnexInspector from 'knex-schema-inspector/dist/dialects/sqlite';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { Dialect } from '../../interface/dialect.type';
import { IDialectInspector } from '../../interface/inspector.interface';
import { MySQLInspector } from './dialect/mysql.inspector';
import { PostgresInspector } from './dialect/postgres.inspector';
import { SQLiteInspector } from './dialect/sqlite.inspector';

export class Inspector {
  protected schemaInspector: SchemaInspector;
  protected customInspector: IDialectInspector;

  constructor(knex: Knex, readonly dialect: Dialect) {
    switch (dialect) {
      case 'postgres':
        this.customInspector = new PostgresInspector(knex);
        this.schemaInspector = new PostgreSQLKnexInspector(knex);
        break;
      case 'sqlite':
        this.customInspector = new SQLiteInspector(knex);
        this.schemaInspector = new SQLiteKnexInspector(knex);
        break;
      case 'mysql':
      case 'mariadb':
        this.customInspector = new MySQLInspector(knex);
        this.schemaInspector = new MySQLKnexInspector(knex);
        break;
    }
  }

  tables(): Promise<string[]> {
    return this.schemaInspector.tables();
  }

  columns(tableName: string): Promise<Column[]> {
    return this.schemaInspector.columnInfo(tableName);
  }

  foreignKeys(tableName: string): Promise<ForeignKey[]> {
    return this.schemaInspector.foreignKeys(tableName);
  }

  // Get unique keys/
  uniques(tableName: string) {
    return this.customInspector.getUniques(tableName);
  }

  getType(tableName: string, columnName: string) {
    return this.customInspector.getSpecialType(tableName, columnName);
  }

  isTypeExists(typeName: string) {
    return this.customInspector.isTypeExists(typeName);
  }

  getTablesForType(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]> {
    return this.customInspector.getTablesForType(typeName);
  }
}
