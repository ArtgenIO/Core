import { diff } from 'just-diff';
import { SchemaInspector } from 'knex-schema-inspector/dist/types/schema-inspector';
import { isEqual } from 'lodash';
import { ISchema } from '../../../schema';
import { IDatabaseLink } from '../../interface';
import { toSchema } from '../converters/to-schema';
import { toStructure } from '../converters/to-structure';
import { QueryInstruction } from './query-plan';

export const doAlterTable = async (
  schema: ISchema,
  link: IDatabaseLink,
  inspector: SchemaInspector,
): Promise<QueryInstruction[]> => {
  const instructions: QueryInstruction[] = [];

  const columns = await inspector.columnInfo(schema.tableName);
  const foreignKeys = await inspector.foreignKeys(schema.tableName);

  // TODO need to read the unique sets from the table
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

    for (const change of changes) {
      // Field has been removed
      if (change.op === 'remove' && change.path[0] === 'fields') {
        instructions.push({
          type: 'drop',
          query: link.connection.schema.alterTable(schema.tableName, t =>
            t.dropColumn(revStruct.fields[change.path[1]].columnName),
          ),
        });
      }
    }

    console.log('Struct mismatch!', changes);
    console.log('Known', knownStruct);
    console.log('Reversed', revStruct);

    if (1) process.exit(1);
  }

  return instructions;
};
