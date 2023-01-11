import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { MySQLAdapter } from '../library/inspectors/mysql.adapter';
import { PostgresAdapter } from '../library/inspectors/postgres.adapter';
import { SQLiteAdapter } from '../library/inspectors/sqlite.adapter';
import { IDatabaseConnection } from '../types/database-connection.interface';
import { IEnumeratorStructure as Enum } from '../types/inspector';
import { IDatabaseInspectorAdapter } from '../types/inspector/database-inspector.interface';

export class DatabaseInspector {
  protected adapter: IDatabaseInspectorAdapter;

  constructor(protected connection: IDatabaseConnection) {
    switch (connection.dialect) {
      case 'postgres':
        this.adapter = new PostgresAdapter(connection.knex);
        break;
      case 'sqlite':
        this.adapter = new SQLiteAdapter(connection.knex);
        break;
      case 'mysql':
      case 'mariadb':
        this.adapter = new MySQLAdapter(connection.knex);
        break;
    }
  }

  /**
   * @inheritdoc
   */
  async enumerators(tableName: string, columns: Column[]): Promise<Enum[]> {
    return this.adapter?.enumerators
      ? this.adapter.enumerators(tableName, columns)
      : [];
  }

  /**
   * @inheritdoc
   */
  tables(): Promise<string[]> {
    return this.adapter.tables();
  }

  /**
   * @inheritdoc
   */
  columns(tableName: string): Promise<Column[]> {
    return this.adapter.columnInfo(tableName);
  }

  /**
   * @inheritdoc
   */
  foreignKeys(tableName: string): Promise<ForeignKey[]> {
    return this.adapter.foreignKeys(tableName);
  }

  /**
   * @inheritdoc
   */
  uniques(tableName: string) {
    return this.adapter.uniques(tableName);
  }

  isTypeExists(typeName: string) {
    return this.adapter.isTypeExists(typeName);
  }

  /**
   * @inheritdoc
   */
  associatedTables(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]> {
    return this.adapter.associatedTables(typeName);
  }

  /**
   * MariaDB special for JSON checks
   */
  async isJson(tableName: string, columnName: string): Promise<boolean> {
    return this.adapter.isJson(tableName, columnName);
  }
}
