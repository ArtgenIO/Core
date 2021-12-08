import { Column } from 'knex-schema-inspector/dist/types/column';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { IEnumeratorStructure as Enum } from '.';
import { IAssociatedTable } from './associated-table.interface';

export type Unique = {
  name: string;
  columns: string[];
};

export interface IDatabaseInspectorAdapter extends SchemaInspector {
  /**
   * Finds the compositive uniques for the given table.
   */
  uniques(tableName: string): Promise<Unique[]>;

  /**
   * Finds the enumerator columns with their values for the given table.
   */
  enumerators?(tableName: string, columns: Column[]): Promise<Enum[]>;

  isTypeExists?(typeName: string): Promise<boolean>;

  isJson?(tableName: string, columnName: string): Promise<boolean>;

  /**
   * Finds tables which use the given types.
   *
   * Only in PG, where the enumerators are defined as a type, and multiple table can use it.
   */
  associatedTables?(type: string): Promise<IAssociatedTable[]>;
}
