import { DeepPartial } from '../../../app/interface/deep-partial.interface';
import { ISchema } from '../types/schema.interface';
import { migrateField } from './migrate-field';

export const migrateSchema = (schema: DeepPartial<ISchema>): ISchema => {
  // Access control
  if (!schema.access) {
    schema.access = {
      create: 'protected',
      read: 'protected',
      update: 'protected',
      delete: 'protected',
    };
  }

  if (!schema.moduleId) {
    schema.moduleId = null;
  }

  if (!schema.meta) {
    schema.meta = {};
  }

  // Content manager
  if (typeof schema.meta.isFavorite === 'undefined') {
    schema.meta.isFavorite = false;
  }

  // Artboard
  if (!schema.meta.artboard) {
    schema.meta.artboard = {};
  }

  if (!schema.meta.artboard) {
    schema.meta.artboard = {};
  }

  if (!schema.meta.artboard.position) {
    schema.meta.artboard.position = {
      x: 0,
      y: 0,
    };
  }

  schema.fields.forEach(migrateField);

  return schema as ISchema;
};
