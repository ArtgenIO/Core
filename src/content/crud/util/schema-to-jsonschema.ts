import { JSONSchema7Definition } from 'json-schema';
import { FieldTag, FieldType, ISchema } from '../../schema';
import { CrudAction } from '../interface/crud-action.enum';

export const schemaToJsonSchema = (
  schema: ISchema,
  action: CrudAction,
): JSONSchema7Definition => {
  const jschema: JSONSchema7Definition = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const field of schema.fields) {
    if (action === CrudAction.CREATE) {
      // Primary UUID is auto generated
      if (
        field.tags.includes(FieldTag.PRIMARY) &&
        field.type == FieldType.UUID
      ) {
        continue;
      }

      // Created At / Updated At / Deleted At field is auto generated
      if (
        field.tags.includes(FieldTag.CREATED) ||
        field.tags.includes(FieldTag.UPDATED) ||
        field.tags.includes(FieldTag.VERSION) ||
        field.tags.includes(FieldTag.DELETED)
      ) {
        continue;
      }
    }

    const fieldDef: JSONSchema7Definition = {
      title: field.label,
      type: 'string',
      readOnly: field.tags.includes(FieldTag.PRIMARY),
      default: null,
    };

    switch (field.type) {
      case FieldType.BOOLEAN:
        fieldDef.type = 'boolean';
        fieldDef.default = false;
        break;
      case FieldType.JSON:
      case FieldType.DATE:
      case FieldType.TEXT:
      case FieldType.UUID:
        fieldDef.type = 'string';
        fieldDef.default = field.defaultValue as any;
        break;
      case FieldType.INTEGER:
        fieldDef.type = 'number';
        fieldDef.default = field.defaultValue as any;
        break;
    }

    jschema.properties[field.reference] = fieldDef;

    // Required if not nullable
    if (!field.tags.includes(FieldTag.NULLABLE)) {
      jschema.required.push(field.reference);
    }
  }

  return jschema;
};
