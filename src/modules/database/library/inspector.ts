import { Knex } from 'knex';
import createInspector from 'knex-schema-inspector';
import { Column } from 'knex-schema-inspector/dist/types/column';
import { ForeignKey } from 'knex-schema-inspector/dist/types/foreign-key';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';

export class Inspector {
  protected knexInspector: SchemaInspector;

  constructor(knex: Knex) {
    this.knexInspector = createInspector(knex);
  }

  tables(): Promise<string[]> {
    return this.knexInspector.tables();
  }

  columns(tableName: string): Promise<Column[]> {
    return this.knexInspector.columnInfo(tableName);
  }

  foreignKeys(tableName: string): Promise<ForeignKey[]> {
    return this.knexInspector.foreignKeys(tableName);
  }
}
