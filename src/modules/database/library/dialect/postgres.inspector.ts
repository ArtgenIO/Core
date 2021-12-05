import { Knex } from 'knex';
import { FieldType, IField } from '../../../collection';
import { IDialectInspector, Unique } from '../../interface/inspector.interface';

export class PostgresInspector implements IDialectInspector {
  constructor(protected knex: Knex) {}

  async isTypeExists(typeName: string): Promise<boolean> {
    const query = this.knex('pg_type').where({ typname: typeName }).count();
    const result = await query;

    return result[0].count == 1;
  }

  async getSpecialType(
    tableName: string,
    columnName: string,
  ): Promise<Pick<IField, 'type' | 'typeParams'>> {
    const query = this.knex({
      e: 'pg_enum',
    })
      .select({
        type: 't.typname',
        value: 'e.enumlabel',
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
        'c.column_name': columnName,
      })
      .groupBy(['e.enumlabel', 't.typname']);

    const rows = await query;

    return {
      type: FieldType.ENUM,
      typeParams: {
        values: rows.map(r => r.value),
      },
    };
  }

  async getTablesForType(
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
