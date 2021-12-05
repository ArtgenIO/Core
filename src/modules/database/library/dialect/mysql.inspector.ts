import { Knex } from 'knex';
import { IDialectInspector, Unique } from '../../interface/inspector.interface';

export class MySQLInspector implements IDialectInspector {
  constructor(protected knex: Knex) {}

  async getUniques(tableName: string): Promise<Unique[]> {
    return [];
  }
}
