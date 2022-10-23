import { RelationType } from '../../schema/interface/relation.interface';
import { ISchema } from '../../schema/interface/schema.interface';
import { FieldTool } from '../../schema/util/field-tools';
import { createCustomRelationLookupFormWidget } from './relation-lookup.form-widget.jsx';

export const generateUIConfig = (schema: ISchema, schemas: ISchema[]) => {
  const uiSchema = {};

  for (const field of schema.fields) {
    // Set the default for every field
    uiSchema[field.reference] = {};

    // JSON is managed with textarea
    if (FieldTool.isJson(field)) {
      uiSchema[field.reference]['ui:widget'] = 'textarea';
    }

    // Nullable fields with default null value
    if (FieldTool.isNullable(field) && field.defaultValue === null) {
      uiSchema[field.reference]['ui:emptyValue'] = null;
    }
  }

  // Find references and update the widget to be an auto complete widget.
  for (const relation of schema.relations.filter(
    r => r.kind === RelationType.BELONGS_TO_ONE,
  )) {
    uiSchema[relation.localField] = {
      'ui:widget': createCustomRelationLookupFormWidget(
        relation.name,
        schema,
        schemas.find(
          s => s.database === schema.database && s.reference == relation.target,
        )!,
      ),
    };
  }

  return uiSchema;
};
