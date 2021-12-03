import { Knex } from 'knex';
import createInspector from 'knex-schema-inspector';
import { ISchema } from '../../schema';
import { doAlterTable } from './synchronizer/alter-table';
import { doCreateTable } from './synchronizer/create-table';

export const synchronize = async (schema: ISchema, connection: Knex) => {
  const inspector = createInspector(connection);
  const isTableExists = await inspector.hasTable(schema.tableName);

  if (!isTableExists) {
    await doCreateTable(schema, connection);
  } else {
    await doAlterTable(schema, connection, inspector);
  }
};
