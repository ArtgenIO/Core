import { FieldTag, FieldType, ISchema } from '..';

export const createEmptySchema = (database: string): ISchema => ({
  database,
  title: 'New Schema',
  reference: '__new_schema',
  tableName: '__new_schema',
  meta: {
    artboard: {
      position: {
        x: 50,
        y: 50,
      },
    },
  },
  fields: [
    {
      title: 'Identifier',
      reference: 'id',
      columnName: 'id',
      type: FieldType.UUID,
      meta: {},
      args: {},
      tags: [FieldTag.PRIMARY],
    },
  ],
  indices: [],
  uniques: [],
  relations: [],
  tags: ['active'],
});
