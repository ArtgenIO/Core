export type Unique = {
  name: string;
  columns: string[];
};

export interface IDialectInspector {
  getUniques(tableName: string): Promise<Unique[]>;
}
