import { diff } from 'just-diff';
import { Knex } from 'knex';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { isEqual } from 'lodash';
import { ISchema } from '../../../schema';
import { toSchema } from '../converters/to-schema';
import { toStructure } from '../converters/to-structure';

export const doAlterTable = async (
  schema: ISchema,
  connection: Knex,
  inspector: SchemaInspector,
) => {
  const currentInfo = await inspector.columnInfo(schema.tableName);
  const revSchema = toSchema(schema.database, schema.tableName, currentInfo);

  const revStruct = toStructure(revSchema);
  const knownStruct = toStructure(schema);

  if (!isEqual(revStruct, knownStruct)) {
    // const alterQuery = connection.schema.table(schema.tableName, table => {});
    const changes = diff(revStruct, knownStruct);

    console.log('Struct mismatch!', changes);
    console.log('Known', knownStruct);
    console.log('Reversed', revStruct);
  }
};
