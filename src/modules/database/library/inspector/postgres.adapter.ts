import BaseAdapter from 'knex-schema-inspector/dist/dialects/postgres';
import { Column } from 'knex-schema-inspector/dist/types/column';
import {
  IDatabaseInspectorAdapter as IAdapter,
  IEnumeratorStructure,
  Unique,
} from '../../interface/inspector';

export class PostgresAdapter extends BaseAdapter implements IAdapter {
  async isTypeExists(typeName: string): Promise<boolean> {
    const query = this.knex('pg_type').where({ typname: typeName }).count();
    const result = await query;

    return result[0].count == 1;
  }

  async enumerators(
    tableName: string,
    columns: Column[],
  ): Promise<IEnumeratorStructure[]> {
    const enumColumns = columns
      .filter(col => col.data_type === 'USER-DEFINED')
      .map(c => c.name);

    if (enumColumns.length) {
      const query = this.knex({
        e: 'pg_enum',
      })
        .select({
          type: 't.typname',
          value: 'e.enumlabel',
          column: 'c.column_name',
        })
        .join(
          {
            t: 'pg_type',
          },
          {
            't.oid': 'e.enumtypid',
          },
        )
        .join(
          {
            c: 'information_schema.columns',
          },
          {
            't.typname': 'c.udt_name',
          },
        )
        .where({
          'c.table_name': tableName,
        })
        .whereIn('c.column_name', enumColumns)
        .groupBy(['e.enumlabel', 't.typname', 'c.column_name']);

      const rows = await query;
      const enums = new Map<string, string[]>(enumColumns.map(n => [n, []]));

      for (const row of rows) {
        enums.get(row.column).push(row.value);
      }

      return Array.from(enums.entries()).map(([column, values]) => ({
        column,
        values,
      }));
    }

    return [];
  }

  async associatedTables(
    typeName: string,
  ): Promise<{ tableName: string; columName: string }[]> {
    const query = this.knex({
      e: 'pg_enum',
    })
      .select({
        tableName: 'c.table_name',
        columnName: 'c.column_name',
      })
      .join(
        {
          t: 'pg_type',
        },
        {
          't.oid': 'e.enumtypid',
        },
      )
      .join(
        {
          c: 'information_schema.columns',
        },
        {
          't.typname': 'c.udt_name',
        },
      )
      .where({
        't.typname': typeName,
      })
      .groupBy(['e.table_name', 'c.column_name']);

    const rows = await query;

    return rows;
  }

  async uniques(tableName: string): Promise<Unique[]> {
    const query = this.knex({
      tc: 'information_schema.table_constraints',
    })
      .select({
        uniqueName: 'tc.constraint_name',
        columnName: 'kcu.column_name',
      })
      .join(
        { kcu: 'information_schema.key_column_usage' },
        {
          'tc.table_schema': 'kcu.table_schema',
          'tc.table_name': 'kcu.table_name',
          'tc.constraint_name': 'kcu.constraint_name',
        },
      )
      .where({
        'tc.constraint_type': 'UNIQUE',
        'tc.table_schema': this.knex.raw('current_schema()'),
        'tc.table_name': tableName,
      });

    const rows = await query;
    const uniques: Unique[] = [];

    rows.forEach(r => {
      if (!uniques.find(unq => unq.name === r.uniqueName)) {
        uniques.push({
          name: r.uniqueName,
          columns: [],
        });
      }

      uniques.find(unq => unq.name === r.uniqueName).columns.push(r.columnName);
    });

    return uniques;
  }
}
