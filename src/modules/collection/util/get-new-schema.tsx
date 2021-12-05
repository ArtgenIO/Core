import { FieldTag, FieldType, ICollection } from '..';

export const createEmptySchema = (database: string): ICollection => ({
  icon: 'table',
  version: 2,
  database,
  label: 'New Schema',
  reference: 'newSchema',
  tableName: 'newSchema',
  fields: [
    {
      label: 'Identifier',
      reference: 'id',
      columnName: 'id',
      type: FieldType.UUID,
      typeParams: {
        values: [],
      },
      tags: [FieldTag.PRIMARY],
    },
    {
      label: 'Tags',
      reference: 'tags',
      columnName: 'tags',
      type: FieldType.JSON,
      tags: [FieldTag.TAGS],
      typeParams: {
        values: [],
      },
      defaultValue: [],
    },
  ],
  indices: [],
  uniques: [],
  relations: [],
  tags: ['active'],
  permission: 'rw',
  artboard: {
    position: {
      x: 50,
      y: 50,
    },
  },
});
