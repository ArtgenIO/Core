import { Knex } from 'knex';
import createInspector from 'knex-schema-inspector';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { Dialect } from '../interface/dialect.type';
import { IDialectInspector } from '../interface/inspector.interface';
import { PostgresInspector } from './dialect/postgres.inspector';
import { SQLiteInspector } from './dialect/sqlite.inspector';

export class Inspector {
  protected knexInspector: SchemaInspector;
  protected dialectInspector: IDialectInspector;

  constructor(knex: Knex, readonly dialect: Dialect) {
    this.knexInspector = createInspector(knex);

    switch (dialect) {
      case 'postgres':
        this.dialectInspector = new PostgresInspector(knex);
        break;
      case 'sqlite':
        this.dialectInspector = new SQLiteInspector(knex);
        break;
    }
  }

  tables(): Promise<string[]> {
    return this.knexInspector.tables();
  }

  columns(tableName: string): Promise<Column[]> {
    return this.knexInspector.columnInfo(tableName);
  }

  foreignKeys(tableName: string): Promise<ForeignKey[]> {
    return this.knexInspector.foreignKeys(tableName);
  }

  // Get unique keys/
  uniques(tableName: string) {
    return this.dialectInspector.getUniques(tableName);
  }

  getType(tableName: string, columnName: string) {
    return this.dialectInspector.getSpecialType(tableName, columnName);
  }

  isTypeExists(typeName: string) {
    return this.dialectInspector.isTypeExists(typeName);
  }

  getTablesForType(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]> {
    return this.dialectInspector.getTablesForType(typeName);
  }
}
