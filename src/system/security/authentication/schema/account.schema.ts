import { ISchema } from '../../../../content/schema';
import { FieldTag } from '../../../../content/schema/interface/field-tags.enum';
import { FieldType } from '../../../../content/schema/interface/field-type.enum';

export const AccountSchema: ISchema = {
  database: 'system',
  reference: 'Account',
  label: 'Accounts',
  tableName: 'ArtgenAccounts',
  tags: ['system', 'active'],
  indices: [],
  uniques: [],
  fields: [
    {
      reference: 'id',
      columnName: 'id',
      label: 'Identifier',
      tags: [FieldTag.PRIMARY],
      type: FieldType.UUID,
    },
    {
      reference: 'email',
      columnName: 'email',
      label: 'Email Address',
      tags: [FieldTag.UNIQUE],
      type: FieldType.TEXT,
    },
    {
      reference: 'password',
      columnName: 'password',
      label: 'Password Hash',
      tags: [],
      type: FieldType.TEXT,
    },
  ],
};
