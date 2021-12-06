import { FieldType, ISchema } from '../../../schema';
import { RelationKind } from '../../../schema/interface/relation.interface';
import { isIndexed } from '../../../schema/util/field-tools';
import { Dialect } from '../../interface/dialect.type';

export const toDialect = (schema: ISchema, dialect: Dialect): ISchema => {
  for (const field of schema.fields) {
    // Reversed field text always gets
    if (dialect === 'mysql' || dialect == 'mariadb') {
      // Text and blob cannot have index, just varchar
      if (
        isIndexed(field) ||
        schema.uniques.some(unq => unq.fields.includes(field.reference)) ||
        schema.relations.some(
          rel =>
            (rel.kind == RelationKind.BELONGS_TO_MANY ||
              rel.kind == RelationKind.BELONGS_TO_ONE) &&
            rel.localField == field.reference,
        )
      ) {
        if (field.type == FieldType.BLOB || field.type == FieldType.TEXT) {
          if (!field.typeParams?.length) {
            field.type = FieldType.STRING;
            field.typeParams.length = 255;
          }
        }
      }

      // Text cannot have numeric length
      if (field.type == FieldType.TEXT) {
        if (typeof field.typeParams?.length == 'number') {
          if (field.typeParams.length !== 65535) {
            field.type = FieldType.STRING;
          }
        }
      }

      // MySQL will return with the default 65535 if nothing is set
      if (field.type == FieldType.TEXT) {
        if (!field.typeParams?.length) {
          field.typeParams.length = 65535;
        }
      }

      // MariaDB JSON
      if (field.type == FieldType.JSON) {
        if (field.typeParams?.length) {
          delete field.typeParams.length;
        }
      }

      // Following types cannot have default value
      if (
        [
          FieldType.BLOB,
          FieldType.TEXT,
          FieldType.JSON,
          FieldType.JSONB,
        ].includes(field.type) &&
        typeof field.defaultValue !== 'undefined'
      ) {
        delete field.defaultValue;
      }
    }
  }

  return schema;
};
