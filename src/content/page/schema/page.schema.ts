import { FieldTag, FieldType, ISchema } from '../../schema';

export const PageSchema: ISchema = {
  database: 'system',
  reference: 'Page',
  label: 'Pages',
  tableName: 'ArtgenPages',
  tags: ['active', 'system'],
  fields: [
    {
      reference: 'id',
      columnName: 'id',
      label: 'Identifier',
      type: FieldType.UUID,
      tags: [FieldTag.PRIMARY],
    },
    {
      reference: 'label',
      columnName: 'label',
      label: 'Label',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'domain',
      columnName: 'domain',
      label: 'Domain',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'path',
      columnName: 'path',
      label: 'path',
      type: FieldType.TEXT,
      tags: [],
      defaultValue: '/page/x',
    },
    {
      reference: 'content',
      columnName: 'content',
      label: 'Content',
      type: FieldType.JSON,
      tags: [],
      defaultValue: {},
    },
    {
      reference: 'tags',
      columnName: 'tags',
      label: 'Tags',
      type: FieldType.JSON,
      tags: [],
      defaultValue: ['active'],
    },
  ],
  indices: [],
  uniques: [
    {
      name: 'domain_path_unq',
      fields: ['domain', 'path'],
    },
  ],
};
