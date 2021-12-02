import { FieldTag, FieldType, IField, ISchema } from '..';

export const isPrimary = (field: IField) =>
  field.tags.includes(FieldTag.PRIMARY);

export const isText = (field: IField) =>
  field.type === FieldType.TEXT || field.type === FieldType.BLOB;

export const isNullable = (field: IField) =>
  field.tags.includes(FieldTag.NULLABLE);

export const isAutoGenerated = (field: IField) => {
  if (isPrimary(field)) {
    if (field.type === FieldType.UUID || field.type === FieldType.INTEGER) {
      return true;
    }
  }

  return false;
};

export const isManagedField = (field: IField) =>
  field.tags.includes(FieldTag.CREATED) ||
  field.tags.includes(FieldTag.UPDATED) ||
  field.tags.includes(FieldTag.VERSION) ||
  field.tags.includes(FieldTag.DELETED);

export const isCapability = (field: IField) =>
  field.tags.includes(FieldTag.CREATED) ||
  field.tags.includes(FieldTag.UPDATED) ||
  field.tags.includes(FieldTag.VERSION) ||
  field.tags.includes(FieldTag.TAGS) ||
  field.tags.includes(FieldTag.DELETED);

export const isIndexed = (field: IField) =>
  field.tags.includes(FieldTag.PRIMARY) ||
  field.tags.includes(FieldTag.INDEX) ||
  field.tags.includes(FieldTag.UNIQUE);

export const getTakenColumNames = (schema: ISchema) => [
  ...schema.fields.map(field => field.columnName), // Locked in the table
  ...schema.fields.map(field => field.reference), // Locked in the JSON
  ...schema.relations.map(r => r.localField), // Locked in the table
  ...schema.relations.map(r => r.name), // Locked in the JSON
];
