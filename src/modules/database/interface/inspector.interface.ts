import { IField } from '../../schema';

export type Unique = {
  name: string;
  columns: string[];
};

export interface IDialectInspector {
  getUniques(tableName: string): Promise<Unique[]>;

  getSpecialType?(
    tableName: string,
    columnName: string,
  ): Promise<Pick<IField, 'type' | 'typeParams'>>;

  isTypeExists?(typeName: string): Promise<boolean>;

  getTablesForType?(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]>;
}
