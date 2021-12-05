import { Knex } from 'knex';
import { IDialectInspector, Unique } from '../../interface/inspector.interface';

export class PostgresInspector implements IDialectInspector {
  constructor(protected knex: Knex) {}

  async getUniques(tableName: string): Promise<Unique[]> {
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
