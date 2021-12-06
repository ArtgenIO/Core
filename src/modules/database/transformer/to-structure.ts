import { FieldType, ISchema } from '../../schema';
import { RelationKind } from '../../schema/interface/relation.interface';
import { IDatabaseSchema } from '../interface/table-structure.interface';

const sortByName = (a: { name: string }, b: { name: string }) =>
  a.name > b.name ? 1 : -1;

const sortByValue = (a: string, b: string) => (a > b ? 1 : -1);

// Use dialect to convert types for the dialect
export const toStructure = (schema: ISchema): IDatabaseSchema => {
  // Ensure no spaces are messing up the table name.
  const tableName = schema.tableName.trim();
  // Sort the relations by name.
  const relations = Array.from(schema.relations)
    .sort(sortByName)
    .filter(
      r =>
        r.kind === RelationKind.BELONGS_TO_ONE ||
        r.kind === RelationKind.BELONGS_TO_MANY,
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
  // Strip fields
  const fields = Array.from(schema.fields)
    .sort((a, b) => (a.columnName > b.columnName ? 1 : -1))
    .map(f => ({
      columnName: f.columnName,
      type: f.type === FieldType.JSONB ? FieldType.JSON : f.type,
      typeParams: f.typeParams,
    }));

  return { tableName, relations, uniques, indices, columns: fields };
};
