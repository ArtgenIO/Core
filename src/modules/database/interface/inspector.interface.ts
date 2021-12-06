import { Column } from 'knex-schema-inspector/dist/types/column';
import { IField } from '../../schema';

export type Unique = {
  name: string;
  columns: string[];
};
type EnumColumn = { column: string; values: string[] };

export interface IDialectInspector {
  getUniques(tableName: string): Promise<Unique[]>;
  getEnumerators?(tableName: string, columns: Column[]): Promise<EnumColumn[]>;

  getSpecialType?(
    tableName: string,
    columnName: string,
  ): Promise<Pick<IField, 'type' | 'typeParams'>>;

  isTypeExists?(typeName: string): Promise<boolean>;

  getTablesForType?(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]>;
}
