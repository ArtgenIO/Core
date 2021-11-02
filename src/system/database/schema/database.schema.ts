import { ISchema } from '../../../content/schema';
import { FieldTag } from '../../../content/schema/interface/field-tags.enum';
import { FieldType } from '../../../content/schema/interface/field-type.enum';

export const DatabaseSchema: ISchema = {
  reference: 'Database',
  label: 'Databases',
  tableName: 'ArtgenDatabases',
  database: 'system',
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
      reference: 'name',
      columnName: 'name',
      label: 'Name',
      type: FieldType.TEXT,
      tags: [FieldTag.UNIQUE],
    },
    {
      reference: 'url',
      columnName: 'url',
      label: 'Connection URL',
      type: FieldType.TEXT,
      tags: [],
    },
    {
      reference: 'type',
      columnName: 'type',
      label: 'Type',
      type: FieldType.TEXT,
      tags: [],
    },
  ],
  indices: [],
  uniques: [],
};
