import { FieldTag, FieldType, ISchema } from '..';

export const createEmptySchema = (database: string): ISchema => ({
  database,
  title: 'New Schema',
  reference: 'newSchema',
  tableName: 'new_schema',
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
      args: {},
      tags: [FieldTag.PRIMARY],
    },
    {
      title: 'Tags',
      reference: 'tags',
      columnName: 'tags',
      type: FieldType.JSON,
      tags: [FieldTag.TAGS],
      args: {},
      defaultValue: [],
    },
  ],
  indices: [],
  uniques: [],
  relations: [],
  tags: ['active'],
});
