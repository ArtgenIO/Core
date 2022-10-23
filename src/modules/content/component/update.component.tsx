import Form from '@rjsf/antd';
import { Button, Drawer, message } from 'antd';
import cloneDeep from 'lodash.clonedeep';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { RowLike } from '../../../app/interface/row-like.interface';
import { schemasAtom } from '../../admin/admin.atoms.jsx';
import { useHttpClientSimple } from '../../admin/library/simple.http-client';
import { CrudAction } from '../../rest/interface/crud-action.enum';
import { ISchema } from '../../schema';
import { FieldTool } from '../../schema/util/field-tools';
import { generateUIConfig } from '../util/generate-ui-config.jsx';
import { schemaToJsonSchema } from '../util/schema-to-jsonschema';
import { toRestRecordRoute } from '../util/schema-url';

type Props = {
  schema: ISchema;
  content: RowLike;
  onClose: () => void;
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
    const editableContent = cloneDeep(content);

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
  }, [content]);

  const handleSubmit = async (form: any) => {
    const data = form.formData;

    try {
      await httpClient.patch<any>(toRestRecordRoute(schema, data), data);

      message.success(`Record has been updated!`);
      // Go back to the read index
      onClose();
    } catch (error) {
      message.error(`An error occured while we tried to update the record`);
    }
  };

  return (
    <Drawer
      width="40%"
      visible={true}
      title={`Edit ${schema.title}`}
      onClose={onClose}
    >
      <Form
        schema={formSchema}
        formData={formData}
        onSubmit={form => handleSubmit(form)}
        uiSchema={uiSchema}
        className="mx-2"
      >
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
      </Form>
    </Drawer>
  );
}
