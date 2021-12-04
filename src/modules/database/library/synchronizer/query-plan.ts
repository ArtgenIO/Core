import { Knex } from 'knex';

export interface QueryInstruction {
  type: 'backup' | 'copy' | 'create' | 'constraint' | 'foreign' | 'drop';
  query: Knex.SchemaBuilder;
}
