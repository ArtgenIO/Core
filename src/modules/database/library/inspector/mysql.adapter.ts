import BaseAdapter from 'knex-schema-inspector/dist/dialects/mysql';
import { Column } from 'knex-schema-inspector/dist/types/column';
import {
  IDatabaseInspectorAdapter as IAdapter,
  IEnumeratorStructure as Enum,
  Unique,
} from '../../interface/inspector';

export class MySQLAdapter extends BaseAdapter implements IAdapter {
  async enumerators(tableName: string, columns: Column[]): Promise<Enum[]> {
    const enums: Enum[] = [];

    for (const col of columns) {
      if (col.data_type == 'enum') {
        const row = await this.knex({ c: 'information_schema.columns' })
          .select({
            values: 'column_type',
          })
          .where({
            table_name: tableName,
            column_name: col.name,
          });

        const asText = row[0].values.substr(5, row[0].values.length - 6);

        enums.push({
          column: col.name,
          values: asText.split(`','`).map(v => v.replace(/'/g, '')),
        });
      }
    }

    return enums;
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
