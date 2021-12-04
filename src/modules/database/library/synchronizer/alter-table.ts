import { diff } from 'just-diff';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { isEqual } from 'lodash';
import { ISchema } from '../../../schema';
import { IDatabaseLink } from '../../interface';
import { toSchema } from '../converters/to-schema';
import { toStructure } from '../converters/to-structure';

export const doAlterTable = async (
  schema: ISchema,
  link: IDatabaseLink,
  inspector: SchemaInspector,
) => {
  const columns = await inspector.columnInfo(schema.tableName);
  const foreignKeys = await inspector.foreignKeys(schema.tableName);
  const revSchema = toSchema(
    schema.database,
    schema.tableName,
    columns,
    foreignKeys,
    link,
  );

  const revStruct = toStructure(revSchema);
  const knownStruct = toStructure(schema);

  if (!isEqual(revStruct, knownStruct)) {
    // const alterQuery = connection.schema.table(schema.tableName, table => {});
    const changes = diff(revStruct, knownStruct);

    console.log('Struct mismatch!', changes);
    console.log('Known', knownStruct);
    console.log('Reversed', revStruct);

    if (1) process.exit(1);
  }
};
