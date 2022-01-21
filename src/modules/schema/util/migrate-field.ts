import { IField } from '../interface/field.interface';

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

  return field;
};
