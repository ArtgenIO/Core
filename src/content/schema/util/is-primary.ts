import { FieldTag, IField } from '..';

export const isPrimary = (field: IField) =>
  field.tags.includes(FieldTag.PRIMARY);
