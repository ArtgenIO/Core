import { IField } from '../types/field.interface';

export const migrateField = (field: IField, idx: number = 1): IField => {
  if (!field.meta) {
    field.meta = {};
  }

  if (!field.meta.grid) {
    field.meta.grid = {
      order: idx,
      hidden: false,
      replace: null,
    };
  }

  if (!field.searchable) {
    field.searchable = false;
  }

  return field;
};
