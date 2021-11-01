import { ICollection } from '..';

export const addTimestams = (col: ICollection): ICollection => {
  col.fields.push({
    reference: 'createdAt',
    label: 'Created At',
    columnName: 'createdAt',
    defaultValue: 'now()',
    type: 'timestamp',
    tags: ['created'],
  });

  col.fields.push({
    reference: 'updatedAt',
    label: 'Updated At',
    columnName: 'updatedAt',
    defaultValue: 'now()',
    type: 'timestamp',
    tags: ['updated'],
  });

  return col;
};
