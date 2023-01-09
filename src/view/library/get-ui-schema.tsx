import { FieldTool } from '../../library/field-tools';
import { ISchema } from '../../models/schema.interface';

export const getUiWidget = (schema: ISchema) => {
  const uiSchema = {};

  for (const field of schema.fields) {
    if (FieldTool.isJson(field)) {
      uiSchema[field.reference] = {
        'ui:widget': 'textarea',
      };
    }
  }

  return uiSchema;
};
