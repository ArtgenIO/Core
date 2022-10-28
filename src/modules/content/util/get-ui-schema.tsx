import { ISchema } from '../../database/types/schema.interface';
import { FieldTool } from '../../database/utils/field-tools';

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
