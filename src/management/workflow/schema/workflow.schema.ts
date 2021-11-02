import { ISchema } from '../../../content/schema';
import { FieldTag } from '../../../content/schema/interface/field-tags.enum';
import { FieldType } from '../../../content/schema/interface/field-type.enum';

export const WorkflowSchema: ISchema = {
  reference: 'Workflow',
  label: 'Workflows',
  tableName: 'ArtgenWorkflows',
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
      reference: 'nodes',
      columnName: 'nodes',
      label: 'Nodes',
      type: FieldType.JSON,
      tags: [],
      defaultValue: [],
    },
    {
      reference: 'edges',
      columnName: 'edges',
      label: 'Edges',
      type: FieldType.JSON,
      tags: [],
      defaultValue: [],
    },
  ],
  indices: [],
  uniques: [],
};
