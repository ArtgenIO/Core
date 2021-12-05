import { FieldTag, FieldType, ISchema } from '../../src/modules/schema';

export const simpleSchema: ISchema = {
  database: 'system',
  reference: 'simple',
  tableName: 'simple',

  // Struct
  fields: [
    {
      label: 'id',
      reference: 'id',
      columnName: 'id',
      type: FieldType.UUID,
      typeParams: {
        values: [],
      },
      defaultValue: undefined,
      tags: [FieldTag.PRIMARY],
    },
  ],
  indices: [],
  relations: [],
  uniques: [],

  // Meta
  label: 'Simple',
  version: 2,
  artboard: {
    position: { x: 0, y: 0 },
  },
  icon: 'widgets',
  permission: 'rw',
  tags: [],
};
