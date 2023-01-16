import Form from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { Button, Drawer, message } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldTool } from '../../../../api/library/field-tools.js';
import { CrudAction } from '../../../../api/types/crud-action.enum.js';
import { RowLike } from '../../../../api/types/row-like.interface.js';
import { ISchema } from '../../../../models/schema.interface.js';
import { schemasAtom } from '../../atoms/admin.atoms.jsx';
import LoadingComponent from '../../layout/loading/loading.component.jsx';
import { generateUIConfig } from '../../library/generate-ui-config.jsx';
import { schemaToJsonSchema } from '../../library/schema-to-jsonschema';
import { toRestRecordRoute } from '../../library/schema-url';
import { useHttpClientSimple } from '../../library/simple.http-client';

type Props = {
  schema: ISchema;
  content: RowLike;
  onClose: (hasChanged: boolean) => void;
};

export default function ContentUpdateComponent({
  content,
  schema,
  onClose,
}: Props) {
  const httpClient = useHttpClientSimple();
  const schemas = useRecoilValue(schemasAtom);
  const [formSchema, setFormSchema] = useState({});
  const [formData, setFormData] = useState(null);
  const [uiSchema, setUiSchema] = useState<any>({});
  const [record, setRecord] = useState<RowLike | null>(null);

  useEffect(() => {
    if (content) {
      httpClient
        .get<RowLike>(toRestRecordRoute(schema, content))
        .then(res => setRecord(res.data));
    }
  }, [content]);

  useEffect(() => {
    if (schema) {
      const formSchema = schemaToJsonSchema(schema, CrudAction.UPDATE, true);
      const uiSchema = generateUIConfig(schema, schemas);

      setFormSchema(formSchema);
      setUiSchema(uiSchema);
    }
    return () => {
      setFormSchema({});
    };
  }, [schema]);

  useEffect(() => {
    if (record) {
      const editableContent = cloneDeep(record);

      for (const field of schema.fields) {
        if (FieldTool.isJson(field)) {
          if (editableContent[field.reference]) {
            try {
              editableContent[field.reference] = JSON.stringify(
                editableContent[field.reference],
                null,
                2,
              );
            } catch (error) {}
          }
        }
      }

      setFormData(editableContent);
    }
  }, [record]);

  const handleSubmit = async (form: any) => {
    const data = form.formData;

    try {
      await httpClient.patch<any>(toRestRecordRoute(schema, data), data);

      message.success(`Record has been updated!`);
      // Go back to the read index
      onClose(true);
    } catch (error) {
      message.error(`An error occured while we tried to update the record`);
    }
  };

  return (
    <Drawer
      width="40%"
      open={true}
      title={`Edit ${schema.title}`}
      onClose={() => onClose(false)}
    >
      {formData ? (
        <Form
          validator={validator}
          schema={formSchema}
          formData={formData}
          onSubmit={form => handleSubmit(form)}
          uiSchema={uiSchema}
          className="mx-2"
        >
          <Button className="success" block htmlType="submit">
            Save Changes
          </Button>
        </Form>
      ) : (
        <LoadingComponent />
      )}
    </Drawer>
  );
}
