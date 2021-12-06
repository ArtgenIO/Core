import { Knex } from 'knex';
import {
  IDialectInspector,
  Unique,
} from '../../../interface/inspector.interface';

type IndexRecord = {
  name: string;
  origin: 'c' | 'pk';
};

type IndexInfoRecord = {
  name: string;
};

type EnumChecks = {
  columnName: string;
  values: [];
};

export class SQLiteInspector implements IDialectInspector {
  constructor(protected knex: Knex) {}

  async getUniques(tableName: string): Promise<Unique[]> {
    const uniques: Unique[] = [];
    const indices = await this.knex.raw<IndexRecord[]>(
      `PRAGMA index_list('${tableName}')`,
    );

    for (const index of indices) {
      if (index.origin === 'c') {
        const columns = await this.knex.raw<IndexInfoRecord[]>(
          `PRAGMA index_info('${index.name}')`,
        );

        uniques.push({
          name: index.name.replace(tableName, ''),
          columns: columns.map(col => col.name),
        });
      }
    }

    return uniques;
  }
}
