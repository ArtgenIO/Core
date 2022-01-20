import { FieldTag, FieldType, ISchema } from '..';
import { migrateSchema } from './migrate-schema';

export const createEmptySchema = (database: string): ISchema =>
  migrateSchema({
    database,
    title: 'New Schema',
    reference: '__new_schema',
    tableName: '__new_schema',
    moduleId: null,
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
    access: {
      create: 'protected',
      read: 'protected',
      update: 'protected',
      delete: 'protected',
    },
  } as ISchema);
