import { Constructor } from '@loopback/context';
import Adapter from 'knex-schema-inspector/dist/dialects/postgres';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import {
  IDatabaseInspectorAdapter as IAdapter,
  IEnumeratorStructure,
  Unique,
} from '../../interface/inspector';

const Postgres = (Adapter as any).default as Constructor<SchemaInspector>;

export class PostgresAdapter extends Postgres implements IAdapter {
  async isTypeExists(typeName: string): Promise<boolean> {
    const query = this.knex('pg_type').where({ typname: typeName }).count();
    const result = await query;

    return result[0].count == 1;
  }

  protected genericTypes(): RegExp[] {
    return [
      /^bigint/i,
      /^int8/i,
      /^bigserial/i,
      /^serial8/i,
      /^bit/i,
      /^bit varying/i,
      /^boolean/i,
      /^bool/i,
      /^box/i,
      /^bytea/i,
      /^character/i,
      /^char/i,
      /^character varying/i,
      /^varchar/i,
      /^cidr/i,
      /^circle/i,
      /^date/i,
      /^double precision/i,
      /^float8/i,
      /^inet/i,
      /^integer/i,
      /^int/i,
      /^int4/i,
      /^interval/i,
      /^line/i,
      /^json/i,
      /^macaddr/i,
      /^jsonb/i,
      /^money/i,
      /^lseg/i,
      /^decimal/i,
      /^macaddr8/i,
      /^pg_lsn/i,
      /^numeric/i,
      /^point/i,
      /^path/i,
      /^real/i,
      /^pg_snapshot/i,
      /^smallint/i,
      /^polygon/i,
      /^smallserial/i,
      /^float4/i,
      /^serial/i,
      /^int2/i,
      /^text/i,
      /^serial2/i,
      /^timetz/i,
      /^serial4/i,
      /^tsquery/i,
      /^time/i,
      /^txid_snapshot/i,
      /^timestamp/i,
      /^xml/i,
      /^tsvector/i,
      /^uuid/i,
    ];
  }

  async enumerators(
    tableName: string,
    columns: Column[],
  ): Promise<IEnumeratorStructure[]> {
    const enumColumns = columns
      .filter(col => !this.genericTypes().some(p => p.test(col.data_type)))
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
