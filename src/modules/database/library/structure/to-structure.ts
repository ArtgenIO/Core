import { ITableStructure } from '../..';
import { FieldType, ISchema } from '../../../schema';
import { RelationType } from '../../../schema/interface/relation.interface';

export const toStructure = (schema: ISchema): ITableStructure => {
  const sortByName = (a: { name: string }, b: { name: string }) =>
    a.name > b.name ? 1 : -1;
  const sortByValue = (a: string, b: string) => (a > b ? 1 : -1);

  // Ensure no spaces are messing up the table name.
  const tableName = schema.tableName.trim();
  // Sort the relations by name.
  const relations = Array.from(schema.relations)
    .sort(sortByName)
    .filter(
      r =>
        r.kind === RelationType.BELONGS_TO_ONE ||
        r.kind === RelationType.BELONGS_TO_MANY,
    )
    .map(r => ({
      target: r.target,
      localField: r.localField,
      remoteField: r.remoteField,
    }));
  // Sort the uniques
  const uniques = Array.from(schema.uniques)
    .sort(sortByName)
    .map(unq => ({
      fields: unq.fields.sort(sortByValue),
    }));
  // Sort the indices
  const indices = Array.from(schema.indices).sort(sortByName);
  const columns = {};

  for (const f of schema.fields) {
    if (f.args?.values?.length) {
      f.args.values = f.args.values
        .map(v => v.toString())
        .sort((a, b) => (a > b ? 1 : -1));
    }

    columns[f.columnName] = {
      columnName: f.columnName,
      type: f.type === FieldType.JSONB ? FieldType.JSON : f.type,
      args: f.args,
    };
  }

  return { tableName, relations: [], uniques, indices, columns: columns };
};
