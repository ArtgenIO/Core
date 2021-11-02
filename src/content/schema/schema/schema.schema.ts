import { ISchema } from '..';
import { FieldTag } from '../interface/field-tags.enum';
import { FieldType } from '../interface/field-type.enum';

export const SchemaSchema: ISchema = {
  database: 'system',
  reference: 'Schema',
  label: 'Schemas',
  tableName: 'ArtgenSchemas',
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
      reference: 'database',
      columnName: 'database',
      label: 'Database',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'reference',
      columnName: 'reference',
      label: 'Rerefence',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'label',
      columnName: 'label',
      label: 'Label',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'tableName',
      columnName: 'tableName',
      label: 'Table Name',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'fields',
      columnName: 'fields',
      label: 'Fields',
      type: FieldType.JSON,
      tags: [],
      defaultValue: [],
    },
    {
      reference: 'indices',
      columnName: 'indices',
      label: 'Indices',
      type: FieldType.JSON,
      tags: [],
      defaultValue: [],
    },
    {
      reference: 'uniques',
      columnName: 'uniques',
      label: 'Uniques',
      type: FieldType.JSON,
      tags: [],
      defaultValue: [],
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
      name: 'database_reference_unq',
      fields: ['database', 'reference'],
    },
  ],
};
