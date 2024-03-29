import { Constructor } from '@loopback/context';
import Adapter from 'knex-schema-inspector/dist/dialects/sqlite';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import {
  IDatabaseInspectorAdapter,
  IEnumeratorStructure,
  Unique,
} from '../../types/inspector';

type IndexRecord = {
  name: string;
  origin: 'c' | 'pk';
};

type IndexInfoRecord = {
  name: string;
};

const SQLite = (Adapter as any).default as Constructor<SchemaInspector>;

export class SQLiteAdapter extends SQLite implements IDatabaseInspectorAdapter {
  async enumerators(
    tableName: string,
    columns: Column[],
  ): Promise<IEnumeratorStructure[]> {
    const enums: IEnumeratorStructure[] = [];
    const colNames = columns.map(c => c.name);

    let cTable: string = (
      await this.knex.raw(
        'SELECT sql FROM sqlite_master WHERE tbl_name = ?;',
        tableName,
      )
    )[0].sql;

    // Ugly regexp, super error prone, later I gona use an AST parser here, but those take a lot of time
    // so, for now we just gona go on with this.

    // Remove the create table "name" ($1) -> $1
    cTable = cTable
      .trim()
      .replace(/^create\s+table\s+\"[^\"]+\"\s+\((.+)\)$/i, '$1');

    const matches = cTable.matchAll(
      /CHECK\s\(`([^`]+)`\sin\(((('[^']+')\s*\,?\s*)+)\){2}/g,
    );

    for (const match of matches) {
      const values = match[2].split(' , ');

      if (colNames.includes(match[1])) {
        enums.push({
          column: match[1],
          values: values.map(v => v.substr(1, v.length - 2)),
        });
      }
    }

    return enums;
  }

  async uniques(tableName: string): Promise<Unique[]> {
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
