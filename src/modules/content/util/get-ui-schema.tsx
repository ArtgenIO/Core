import { ISchema } from '../../schema/interface/schema.interface';
import { FieldTool } from '../../schema/util/field-tools';

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
